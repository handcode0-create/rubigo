-- ============================================================
-- RUBIGO — Backend Validation Admin
-- Migration : 20260915_admin_validation_backend.sql
--
-- Objectif :
--   1. permettre à un utilisateur de déposer une demande
--   2. permettre à un admin de valider/refuser une demande
--   3. synchroniser la validation avec profiles.role
--   4. garder toutes les opérations sensibles côté DB
-- ============================================================


-- ============================================================
-- 1. SOUMETTRE UNE DEMANDE PROFESSIONNELLE
-- ============================================================

create or replace function public.submit_professional_request(
  p_request_type text,
  p_requested_role text,
  p_title text,
  p_note text default null,
  p_payload jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_request_id uuid;
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'Utilisateur non authentifié';
  end if;

  if p_request_type not in (
    'merchant_application',
    'driver_application'
  ) then
    raise exception 'Type de demande professionnelle invalide';
  end if;

  if p_requested_role not in (
    'merchant',
    'driver'
  ) then
    raise exception 'Rôle professionnel invalide';
  end if;


  -- Le compte doit exister dans profiles.
  if not exists (
    select 1
    from public.profiles
    where id = v_user_id
  ) then
    raise exception 'Profil utilisateur introuvable';
  end if;


  -- Empêche les doublons de demandes encore ouvertes.
  if exists (
    select 1
    from public.admin_requests
    where user_id = v_user_id
      and request_type = p_request_type
      and status = 'pending'
  ) then
    raise exception 'Une demande similaire est déjà en attente';
  end if;


  insert into public.admin_requests (
    user_id,
    request_type,
    requested_role,
    status,
    title,
    note,
    payload
  )
  values (
    v_user_id,
    p_request_type,
    p_requested_role,
    'pending',
    p_title,
    p_note,
    coalesce(p_payload, '{}'::jsonb)
  )
  returning id
  into v_request_id;


  return v_request_id;
end;
$$;


revoke all
on function public.submit_professional_request(
  text,
  text,
  text,
  text,
  jsonb
)
from public;

grant execute
on function public.submit_professional_request(
  text,
  text,
  text,
  text,
  jsonb
)
to authenticated;



-- ============================================================
-- 2. TRAITER UNE DEMANDE ADMIN
-- ============================================================

create or replace function public.admin_review_request(
  p_request_id uuid,
  p_decision text,
  p_note text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_admin_id uuid;
  v_request public.admin_requests%rowtype;
  v_new_role text;
begin
  v_admin_id := auth.uid();

  if v_admin_id is null then
    raise exception 'Administrateur non authentifié';
  end if;


  -- Vérification centrale des droits administrateur.
  if not public.is_admin() then
    raise exception 'Accès administrateur refusé';
  end if;


  if p_decision not in (
    'approved',
    'rejected',
    'suspended',
    'cancelled'
  ) then
    raise exception 'Décision administrative invalide';
  end if;


  select *
  into v_request
  from public.admin_requests
  where id = p_request_id
  for update;


  if not found then
    raise exception 'Demande introuvable';
  end if;


  if v_request.status <> 'pending' then
    raise exception 'Cette demande a déjà été traitée';
  end if;


  -- ==========================================================
  -- APPROBATION
  -- ==========================================================

  if p_decision = 'approved' then

    if v_request.requested_role in ('merchant', 'driver') then

      v_new_role := v_request.requested_role;

      update public.profiles
      set
        role = v_new_role::public.user_role,
        is_active = true,
        updated_at = now()
      where id = v_request.user_id;

    end if;

  end if;


  -- ==========================================================
  -- REFUS / SUSPENSION / ANNULATION
  --
  -- Important :
  -- on ne rétrograde pas ici automatiquement un utilisateur
  -- qui aurait déjà un rôle professionnel.
  -- La décision porte d'abord sur la demande.
  -- ==========================================================


  update public.admin_requests
  set
    status = p_decision,
    reviewed_by = v_admin_id,
    reviewed_at = now(),
    note = case
      when p_note is null or trim(p_note) = ''
        then note
      when note is null or trim(note) = ''
        then p_note
      else
        note || E'\n' || p_note
    end,
    updated_at = now()
  where id = p_request_id;


  return jsonb_build_object(
    'success', true,
    'request_id', v_request.id,
    'user_id', v_request.user_id,
    'request_type', v_request.request_type,
    'requested_role', v_request.requested_role,
    'status', p_decision
  );
end;
$$;


revoke all
on function public.admin_review_request(
  uuid,
  text,
  text
)
from public;

grant execute
on function public.admin_review_request(
  uuid,
  text,
  text
)
to authenticated;



-- ============================================================
-- 3. LECTURE DES DEMANDES POUR L'ADMIN
-- ============================================================

create or replace function public.admin_list_requests()
returns setof jsonb
language sql
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'id', r.id,
    'user_id', r.user_id,
    'request_type', r.request_type,
    'requested_role', r.requested_role,
    'status', r.status,
    'title', r.title,
    'note', r.note,
    'payload', r.payload,
    'reviewed_by', r.reviewed_by,
    'reviewed_at', r.reviewed_at,
    'created_at', r.created_at,
    'updated_at', r.updated_at,

    'profile', (
      select jsonb_build_object(
        'id', p.id,
        'name', p.name,
        'phone', p.phone,
        'city', p.city,
        'initials', p.initials,
        'role', p.role,
        'is_active', p.is_active,
        'merchant_local_id', p.merchant_local_id,
        'email', u.email
      )
      from public.profiles p
      left join auth.users u
        on u.id = p.id
      where p.id = r.user_id
    )
  )
  from public.admin_requests r
  where public.is_admin()
  order by r.created_at desc;
$$;


revoke all
on function public.admin_list_requests()
from public;

grant execute
on function public.admin_list_requests()
to authenticated;