create schema if not exists keyboard_journeys;

create table if not exists keyboard_journeys.meta_budget (
  singleton boolean primary key default true check (singleton),
  cap_micro_usd bigint not null check (cap_micro_usd = 20000000),
  spent_micro_usd bigint not null default 0 check (spent_micro_usd >= 0),
  reserved_micro_usd bigint not null default 0 check (reserved_micro_usd >= 0),
  enabled boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists keyboard_journeys.meta_reservations (
  request_id uuid primary key,
  reserved_micro_usd bigint not null check (reserved_micro_usd = 50000),
  actual_micro_usd bigint,
  status text not null check (status in ('reserved','settled')),
  created_at timestamptz not null default now(),
  settled_at timestamptz,
  check (actual_micro_usd is null or actual_micro_usd >= 0)
);

alter table keyboard_journeys.meta_budget enable row level security;
alter table keyboard_journeys.meta_reservations enable row level security;
revoke all on schema keyboard_journeys from public, anon, authenticated;
revoke all on all tables in schema keyboard_journeys from public, anon, authenticated, service_role;

insert into keyboard_journeys.meta_budget(singleton,cap_micro_usd)
values (true,20000000)
on conflict (singleton) do nothing;

create or replace function public.keyboard_journeys_reserve_meta_call(p_request_id uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare b keyboard_journeys.meta_budget%rowtype;
begin
  if coalesce(auth.role(),'') <> 'service_role' then
    raise insufficient_privilege using message = 'service_role_required';
  end if;
  select * into b from keyboard_journeys.meta_budget where singleton = true for update;
  if not found or not b.enabled then
    return jsonb_build_object('allowed',false,'reason','budget_disabled');
  end if;
  if exists(select 1 from keyboard_journeys.meta_reservations where request_id = p_request_id) then
    return jsonb_build_object('allowed',false,'reason','reservation_exists');
  end if;
  if b.spent_micro_usd + b.reserved_micro_usd + 50000 > b.cap_micro_usd then
    return jsonb_build_object('allowed',false,'reason','budget_exhausted',
      'remaining_usd',greatest(0,b.cap_micro_usd-b.spent_micro_usd-b.reserved_micro_usd)::numeric/1000000);
  end if;
  insert into keyboard_journeys.meta_reservations(request_id,reserved_micro_usd,status)
  values(p_request_id,50000,'reserved');
  update keyboard_journeys.meta_budget
     set reserved_micro_usd = reserved_micro_usd + 50000, updated_at = now()
   where singleton = true returning * into b;
  return jsonb_build_object('allowed',true,
    'remaining_usd',(b.cap_micro_usd-b.spent_micro_usd-b.reserved_micro_usd)::numeric/1000000,
    'reserved_usd',0.05);
end; $$;

create or replace function public.keyboard_journeys_settle_meta_call(p_request_id uuid,p_actual_micro_usd bigint)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare b keyboard_journeys.meta_budget%rowtype; r keyboard_journeys.meta_reservations%rowtype;
begin
  if coalesce(auth.role(),'') <> 'service_role' then
    raise insufficient_privilege using message = 'service_role_required';
  end if;
  if p_actual_micro_usd < 0 or p_actual_micro_usd > 50000 then
    raise check_violation using message = 'actual_cost_outside_reservation';
  end if;
  select * into b from keyboard_journeys.meta_budget where singleton = true for update;
  select * into r from keyboard_journeys.meta_reservations where request_id=p_request_id for update;
  if not found then raise no_data_found using message = 'reservation_not_found'; end if;
  if r.status='settled' then
    return jsonb_build_object('settled',true,'remaining_usd',
      (b.cap_micro_usd-b.spent_micro_usd-b.reserved_micro_usd)::numeric/1000000);
  end if;
  update keyboard_journeys.meta_reservations
     set status='settled',actual_micro_usd=p_actual_micro_usd,settled_at=now()
   where request_id=p_request_id;
  update keyboard_journeys.meta_budget
     set reserved_micro_usd=reserved_micro_usd-r.reserved_micro_usd,
         spent_micro_usd=spent_micro_usd+p_actual_micro_usd,updated_at=now()
   where singleton=true returning * into b;
  return jsonb_build_object('settled',true,'remaining_usd',
      (b.cap_micro_usd-b.spent_micro_usd-b.reserved_micro_usd)::numeric/1000000,
      'spent_usd',b.spent_micro_usd::numeric/1000000);
end; $$;

create or replace function public.keyboard_journeys_meta_budget_status()
returns jsonb language plpgsql security definer set search_path = '' as $$
declare b keyboard_journeys.meta_budget%rowtype;
begin
  if coalesce(auth.role(),'') <> 'service_role' then
    raise insufficient_privilege using message = 'service_role_required';
  end if;
  select * into b from keyboard_journeys.meta_budget where singleton = true;
  if not found then return jsonb_build_object('configured',false,'enabled',false); end if;
  return jsonb_build_object('configured',true,'enabled',b.enabled,
    'cap_usd',b.cap_micro_usd::numeric/1000000,
    'spent_usd',b.spent_micro_usd::numeric/1000000,
    'reserved_usd',b.reserved_micro_usd::numeric/1000000,
    'remaining_usd',(b.cap_micro_usd-b.spent_micro_usd-b.reserved_micro_usd)::numeric/1000000);
end; $$;

revoke all on function public.keyboard_journeys_reserve_meta_call(uuid) from public, anon, authenticated;
revoke all on function public.keyboard_journeys_settle_meta_call(uuid,bigint) from public, anon, authenticated;
revoke all on function public.keyboard_journeys_meta_budget_status() from public, anon, authenticated;
grant execute on function public.keyboard_journeys_reserve_meta_call(uuid) to service_role;
grant execute on function public.keyboard_journeys_settle_meta_call(uuid,bigint) to service_role;
grant execute on function public.keyboard_journeys_meta_budget_status() to service_role;
