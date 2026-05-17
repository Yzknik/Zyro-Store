import axios from 'axios';

export const APP_ROLES = {
    USER: 'user',
    CLIENT: 'client',
    TESTER: 'tester',
    BETA: 'beta',
    RESELLER: 'reseller',
    ADMIN: 'admin',
    OWNER: 'owner'
} as const;

const normalizeRole = (role?: string | null) => String(role || APP_ROLES.USER).trim().toLowerCase();

export const canAccessRole = (userRole?: string | null, requiredRole?: string | null) => {
    const user = normalizeRole(userRole);
    const required = normalizeRole(requiredRole);
    const power: Record<string, number> = {
        [APP_ROLES.USER]: 0,
        [APP_ROLES.CLIENT]: 1,
        [APP_ROLES.TESTER]: 2,
        [APP_ROLES.BETA]: 2,
        [APP_ROLES.RESELLER]: 3,
        [APP_ROLES.ADMIN]: 4,
        [APP_ROLES.OWNER]: 5
    };

    if (!required || required === APP_ROLES.USER) return true;
    return (power[user] ?? 0) >= (power[required] ?? 0);
};

export const getDiscordRoleIdForAppRole = (role?: string | null) => {
    const map: Record<string, string | undefined> = {
        [APP_ROLES.USER]: process.env.DISCORD_VERIFIED_ROLE_ID,
        [APP_ROLES.CLIENT]: process.env.DISCORD_CLIENT_ROLE_ID,
        [APP_ROLES.TESTER]: process.env.DISCORD_TESTER_ROLE_ID,
        [APP_ROLES.BETA]: process.env.DISCORD_BETA_ROLE_ID,
        [APP_ROLES.RESELLER]: process.env.DISCORD_RESELLER_ROLE_ID,
        [APP_ROLES.ADMIN]: process.env.DISCORD_ADMIN_ROLE_ID,
        [APP_ROLES.OWNER]: process.env.DISCORD_OWNER_ROLE_ID
    };

    return map[normalizeRole(role)];
};

export const assignDiscordRole = async (discordId: string, roleId?: string | null) => {
    const token = process.env.BOT_API_KEY;
    const guildId = process.env.GUILD_ID || '1435379479739371603';
    if (!token || !roleId || !discordId) return false;

    try {
        await axios.put(`https://discord.com/api/v10/guilds/${guildId}/members/${discordId}/roles/${roleId}`, {}, {
            headers: { Authorization: `Bot ${token}` }
        });
        return true;
    } catch {
        return false;
    }
};

export const syncDiscordAppRole = async (discordId: string, role?: string | null) => {
    const roleId = getDiscordRoleIdForAppRole(role);
    return assignDiscordRole(discordId, roleId);
};
