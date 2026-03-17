import os
import asyncpg

DATABASE_URL = os.getenv("DATABASE_URL")

async def sync_bot_guild(pool, guild):
    async with pool.acquire() as conn:
        await conn.execute(
            """
            insert into bot_guilds (guild_id, guild_name, updated_at)
            values ($1, $2, now())
            on conflict (guild_id)
            do update set guild_name = excluded.guild_name, updated_at = now()
            """,
            str(guild.id), guild.name
        )

async def remove_bot_guild(pool, guild_id: int):
    async with pool.acquire() as conn:
        await conn.execute("delete from bot_guilds where guild_id = $1", str(guild_id))

async def open_pg_pool():
    if not DATABASE_URL:
        raise RuntimeError("DATABASE_URL not set")
    return await asyncpg.create_pool(DATABASE_URL)
