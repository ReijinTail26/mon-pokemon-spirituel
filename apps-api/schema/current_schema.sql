--
-- PostgreSQL database dump
--

-- Dumped from database version 18.6
-- Dumped by pg_dump version 18.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: assessment_answers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.assessment_answers (
    assessment_id uuid NOT NULL,
    question_id character varying(20) NOT NULL,
    value smallint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT assessment_answers_value_check CHECK (((value >= 1) AND (value <= 5)))
);


--
-- Name: assessment_classifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.assessment_classifications (
    id uuid NOT NULL,
    assessment_result_id uuid NOT NULL,
    animal_name character varying(100) NOT NULL,
    animal_bucket character varying(30) NOT NULL,
    type_1_name character varying(50) NOT NULL,
    type_2_name character varying(50),
    animal_engine_version character varying(50) NOT NULL,
    type_engine_version character varying(50) NOT NULL,
    debug_snapshot jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: assessment_results; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.assessment_results (
    id uuid NOT NULL,
    assessment_id uuid NOT NULL,
    scoring_version character varying(50) NOT NULL,
    o numeric(5,2) NOT NULL,
    c numeric(5,2) NOT NULL,
    e numeric(5,2) NOT NULL,
    a numeric(5,2) NOT NULL,
    n numeric(5,2) NOT NULL,
    r numeric(5,2) NOT NULL,
    l numeric(5,2) NOT NULL,
    p numeric(5,2) NOT NULL,
    h numeric(5,2) NOT NULL,
    i numeric(5,2) NOT NULL,
    m numeric(5,2) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: assessments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.assessments (
    id uuid NOT NULL,
    questionnaire_version character varying(50) NOT NULL,
    status character varying(30) NOT NULL,
    current_question_index integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    user_id uuid,
    visibility character varying(16) DEFAULT 'PRIVATE'::character varying NOT NULL,
    deleted_at timestamp with time zone,
    public_share_token character varying(96),
    final_sheet_filename text,
    final_sheet_mime_type character varying(64),
    final_sheet_size_bytes bigint,
    final_sheet_uploaded_at timestamp with time zone,
    community_published_at timestamp with time zone,
    evolution_slot_unlocked boolean DEFAULT false NOT NULL,
    evolution_slot_unlocked_at timestamp with time zone,
    evolution_sheet_filename text,
    evolution_sheet_mime_type character varying(64),
    evolution_sheet_size_bytes bigint,
    evolution_sheet_uploaded_at timestamp with time zone,
    evolution_reward_decided_at timestamp with time zone,
    evolution_seed_pdf_created_at timestamp with time zone,
    evolution_reward_revealed_at timestamp with time zone,
    CONSTRAINT assessments_visibility_check CHECK (((visibility)::text = ANY ((ARRAY['PRIVATE'::character varying, 'UNLISTED'::character varying, 'PUBLIC'::character varying])::text[])))
);


--
-- Name: community_likes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.community_likes (
    assessment_id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: creature_specs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.creature_specs (
    id uuid DEFAULT gen_random_uuid() CONSTRAINT visual_concepts_id_not_null NOT NULL,
    assessment_id uuid CONSTRAINT visual_concepts_assessment_id_not_null NOT NULL,
    version text DEFAULT 'visual-concept-v1'::text CONSTRAINT visual_concepts_version_not_null NOT NULL,
    attempt integer CONSTRAINT visual_concepts_attempt_not_null NOT NULL,
    status text CONSTRAINT visual_concepts_status_not_null NOT NULL,
    spec jsonb,
    structural_validation jsonb,
    critic_result jsonb,
    created_at timestamp with time zone DEFAULT now() CONSTRAINT visual_concepts_created_at_not_null NOT NULL,
    updated_at timestamp with time zone DEFAULT now() CONSTRAINT visual_concepts_updated_at_not_null NOT NULL,
    CONSTRAINT visual_concepts_attempt_check CHECK (((attempt >= 1) AND (attempt <= 3))),
    CONSTRAINT visual_concepts_status_check CHECK ((status = ANY (ARRAY['GENERATED'::text, 'STRUCTURAL_FAIL'::text, 'CRITIC_FAIL'::text, 'CANONICAL'::text])))
);


--
-- Name: generation_jobs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.generation_jobs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    assessment_id uuid NOT NULL,
    status text NOT NULL,
    current_step text,
    error_code text,
    error_message text,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    started_at timestamp with time zone,
    completed_at timestamp with time zone,
    attempt_count integer DEFAULT 0 NOT NULL,
    max_attempts integer DEFAULT 1 NOT NULL,
    locked_at timestamp with time zone,
    heartbeat_at timestamp with time zone,
    CONSTRAINT generation_jobs_attempt_count_check CHECK (((attempt_count >= 0) AND (max_attempts >= 1) AND (attempt_count <= max_attempts))),
    CONSTRAINT generation_jobs_status_check CHECK ((status = ANY (ARRAY['FINALIZING'::text, 'READY'::text, 'FAILED'::text])))
);


--
-- Name: generation_selection_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.generation_selection_history (
    id bigint NOT NULL,
    assessment_id uuid NOT NULL,
    selection_kind character varying(32) NOT NULL,
    scope_key character varying(128) NOT NULL,
    selected_id character varying(255) NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT generation_selection_history_kind_check CHECK (((selection_kind)::text = ANY ((ARRAY['MORPHOLOGY'::character varying, 'VISUAL_SEED'::character varying, 'BACKGROUND'::character varying])::text[])))
);


--
-- Name: generation_selection_history_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.generation_selection_history_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: generation_selection_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.generation_selection_history_id_seq OWNED BY public.generation_selection_history.id;


--
-- Name: user_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_sessions (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    google_sub character varying(255) NOT NULL,
    email character varying(320) NOT NULL,
    email_verified boolean DEFAULT false NOT NULL,
    display_name character varying(255),
    avatar_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    username character varying(24),
    username_updated_at timestamp with time zone
);


--
-- Name: generation_selection_history id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.generation_selection_history ALTER COLUMN id SET DEFAULT nextval('public.generation_selection_history_id_seq'::regclass);


--
-- Name: assessment_answers assessment_answers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessment_answers
    ADD CONSTRAINT assessment_answers_pkey PRIMARY KEY (assessment_id, question_id);


--
-- Name: assessment_classifications assessment_classifications_assessment_result_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessment_classifications
    ADD CONSTRAINT assessment_classifications_assessment_result_id_key UNIQUE (assessment_result_id);


--
-- Name: assessment_classifications assessment_classifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessment_classifications
    ADD CONSTRAINT assessment_classifications_pkey PRIMARY KEY (id);


--
-- Name: assessment_results assessment_results_assessment_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessment_results
    ADD CONSTRAINT assessment_results_assessment_id_key UNIQUE (assessment_id);


--
-- Name: assessment_results assessment_results_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessment_results
    ADD CONSTRAINT assessment_results_pkey PRIMARY KEY (id);


--
-- Name: assessments assessments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessments
    ADD CONSTRAINT assessments_pkey PRIMARY KEY (id);


--
-- Name: community_likes community_likes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_likes
    ADD CONSTRAINT community_likes_pkey PRIMARY KEY (assessment_id, user_id);


--
-- Name: generation_jobs generation_jobs_assessment_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.generation_jobs
    ADD CONSTRAINT generation_jobs_assessment_id_key UNIQUE (assessment_id);


--
-- Name: generation_jobs generation_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.generation_jobs
    ADD CONSTRAINT generation_jobs_pkey PRIMARY KEY (id);


--
-- Name: generation_selection_history generation_selection_history_assessment_kind_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.generation_selection_history
    ADD CONSTRAINT generation_selection_history_assessment_kind_unique UNIQUE (assessment_id, selection_kind);


--
-- Name: generation_selection_history generation_selection_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.generation_selection_history
    ADD CONSTRAINT generation_selection_history_pkey PRIMARY KEY (id);


--
-- Name: user_sessions user_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_pkey PRIMARY KEY (sid);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_google_sub_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_google_sub_key UNIQUE (google_sub);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: creature_specs visual_concepts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.creature_specs
    ADD CONSTRAINT visual_concepts_pkey PRIMARY KEY (id);


--
-- Name: assessments_community_public_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX assessments_community_public_idx ON public.assessments USING btree (community_published_at DESC) WHERE (((visibility)::text = 'PUBLIC'::text) AND (deleted_at IS NULL) AND (final_sheet_filename IS NOT NULL));


--
-- Name: assessments_public_active_created_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX assessments_public_active_created_idx ON public.assessments USING btree (visibility, created_at DESC) WHERE (deleted_at IS NULL);


--
-- Name: assessments_public_share_token_uidx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX assessments_public_share_token_uidx ON public.assessments USING btree (public_share_token) WHERE (public_share_token IS NOT NULL);


--
-- Name: assessments_user_active_created_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX assessments_user_active_created_idx ON public.assessments USING btree (user_id, created_at DESC) WHERE (deleted_at IS NULL);


--
-- Name: assessments_user_id_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX assessments_user_id_created_at_idx ON public.assessments USING btree (user_id, created_at DESC);


--
-- Name: assessments_visibility_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX assessments_visibility_created_at_idx ON public.assessments USING btree (visibility, created_at DESC);


--
-- Name: community_likes_assessment_created_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX community_likes_assessment_created_idx ON public.community_likes USING btree (assessment_id, created_at DESC);


--
-- Name: creature_specs_one_canonical_per_assessment; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX creature_specs_one_canonical_per_assessment ON public.creature_specs USING btree (assessment_id) WHERE (status = 'CANONICAL'::text);


--
-- Name: idx_generation_jobs_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_generation_jobs_status ON public.generation_jobs USING btree (status);

CREATE INDEX idx_generation_jobs_claim ON public.generation_jobs USING btree (status, created_at) WHERE (status = 'FINALIZING'::text);


--
-- Name: idx_generation_selection_history_assessment; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_generation_selection_history_assessment ON public.generation_selection_history USING btree (assessment_id);


--
-- Name: idx_generation_selection_history_recent; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_generation_selection_history_recent ON public.generation_selection_history USING btree (selection_kind, scope_key, id DESC);


--
-- Name: idx_visual_concepts_assessment; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_visual_concepts_assessment ON public.creature_specs USING btree (assessment_id);


--
-- Name: idx_visual_concepts_one_canonical; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_visual_concepts_one_canonical ON public.creature_specs USING btree (assessment_id) WHERE (status = 'CANONICAL'::text);


--
-- Name: user_sessions_expire_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_sessions_expire_idx ON public.user_sessions USING btree (expire);


--
-- Name: users_username_lower_uidx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX users_username_lower_uidx ON public.users USING btree (lower((username)::text)) WHERE ((username IS NOT NULL) AND (deleted_at IS NULL));


--
-- Name: assessment_answers assessment_answers_assessment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessment_answers
    ADD CONSTRAINT assessment_answers_assessment_id_fkey FOREIGN KEY (assessment_id) REFERENCES public.assessments(id) ON DELETE CASCADE;


--
-- Name: assessment_classifications assessment_classifications_assessment_result_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessment_classifications
    ADD CONSTRAINT assessment_classifications_assessment_result_id_fkey FOREIGN KEY (assessment_result_id) REFERENCES public.assessment_results(id) ON DELETE CASCADE;


--
-- Name: assessment_results assessment_results_assessment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessment_results
    ADD CONSTRAINT assessment_results_assessment_id_fkey FOREIGN KEY (assessment_id) REFERENCES public.assessments(id) ON DELETE CASCADE;


--
-- Name: assessments assessments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessments
    ADD CONSTRAINT assessments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: community_likes community_likes_assessment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_likes
    ADD CONSTRAINT community_likes_assessment_id_fkey FOREIGN KEY (assessment_id) REFERENCES public.assessments(id) ON DELETE CASCADE;


--
-- Name: community_likes community_likes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_likes
    ADD CONSTRAINT community_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--
