import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const socialSchema = z.object({
  label: z.string(),
  href: z.url(),
  handle: z.string(),
});

const projectSchema = z.object({
  name: z.string(),
  href: z.url().optional(),
  year: z.string(),
  summary: z.string(),
  stack: z.array(z.string()).min(1),
});

const skillGroupSchema = z.object({
  title: z.string(),
  items: z.array(z.string()).min(1),
});

const timelineSchema = z.object({
  period: z.string(),
  title: z.string(),
  organization: z.string(),
  summary: z.string(),
});

const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '*/*.md' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    translationKey: z.string(),
    readingTime: z.string(),
    tags: z.array(z.string()).default([]),
  }),
});

const profile = defineCollection({
  loader: glob({ base: './src/content/profile', pattern: '*.md' }),
  schema: z.object({
    name: z.string(),
    heroKicker: z.string(),
    heroTitle: z.string(),
    heroLead: z.string(),
    availability: z.string(),
    location: z.string(),
    emailLabel: z.string(),
    emailHref: z.string(),
    contactNote: z.string(),
    socials: z.array(socialSchema).min(1),
    projects: z.array(projectSchema).min(1),
    skillGroups: z.array(skillGroupSchema).min(1),
    timeline: z.array(timelineSchema).min(1),
  }),
});

export const collections = { blog, profile };
