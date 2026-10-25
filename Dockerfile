#--- STAGE 1 ----
# ---- Base image: all dockerfiles start with this ---
FROM node:20-alpine AS base

#--- 2nd layer build second layer from base and call it deps, build the packages and all 
#--- layers after base will be relative to /app so that if /app doesnt exist yet, Docker creates it
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci

#-- STAGE 2: builder---
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG RESEND_API_KEY=placeholder_build_key
ENV RESEND_API_KEY=$RESEND_API_KEY

ARG DATABASE_URL=postgresql://placeholder:placeholder@localhost:5432/placeholder
ENV DATABASE_URL=$DATABASE_URL

ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

ARG NEXT_PUBLIC_VAPI_API_KEY
ENV NEXT_PUBLIC_VAPI_API_KEY=$NEXT_PUBLIC_VAPI_API_KEY

ARG NEXT_PUBLIC_VAPI_ASSISTANT_ID
ENV NEXT_PUBLIC_VAPI_ASSISTANT_ID=$NEXT_PUBLIC_VAPI_ASSISTANT_ID
RUN npm run build

#-- STAGE3: runner ---
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]

#-- RUN executes at build time, CMD defines what runs when container starts from image
