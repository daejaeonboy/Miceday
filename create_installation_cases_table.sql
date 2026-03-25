create table if not exists public.installation_cases (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    subtitle text,
    image_url text not null,
    link text not null default '/company',
    display_order int not null default 0,
    is_active boolean not null default true,
    created_at timestamptz not null default now()
);

create index if not exists idx_installation_cases_display_order
    on public.installation_cases (display_order asc);

create index if not exists idx_installation_cases_is_active
    on public.installation_cases (is_active);
