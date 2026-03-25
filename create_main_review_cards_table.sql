create table if not exists public.main_review_cards (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    subtitle text,
    review_text text not null,
    image_url text not null,
    display_order int not null default 0,
    is_active boolean not null default true,
    created_at timestamptz not null default now()
);

create index if not exists idx_main_review_cards_display_order
    on public.main_review_cards (display_order asc);

create index if not exists idx_main_review_cards_is_active
    on public.main_review_cards (is_active);
