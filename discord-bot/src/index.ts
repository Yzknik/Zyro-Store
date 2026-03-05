// ...imports were above, leaving them intact
import { Client, GatewayIntentBits, Partials, EmbedBuilder, REST, Routes, SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from 'discord.js';
import Database from 'better-sqlite3';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, '../../backend/data/zyro.db');
const db = new Database(dbPath);

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

const GUILD_ID = '1435379479739371603';
const CLIENT_ID = process.env.DISCORD_CLIENT_ID;

// Colors matching the dashboard style
const COLORS = {
    primary: 0x3366ff,
    success: 0x22c55e,
    danger: 0xef4444,
    dark: 0x0c0c0c,
    white: 0xffffff,
    black: 0x000000
};

const commands = [
    new SlashCommandBuilder()
        .setName('perfil')
        .setDescription('👤 Consulte os dados da sua conta e produtos vinculados na Zyro.')
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('Usuário para inspecionar o perfil (Opcional)')
                .setRequired(false)
        ),
    new SlashCommandBuilder()
        .setName('keys')
        .setDescription('🔑 Consulte suas licenças ativas de forma confidencial.'),
    new SlashCommandBuilder()
        .setName('hwid')
        .setDescription('💻 Utilitários de Hardware ID (Resetar).')
        .addSubcommand(subcmd =>
            subcmd.setName('reset')
                .setDescription('Reseta o HWID de todas as suas licenças vinculadas.')
        ),
    new SlashCommandBuilder()
        .setName('status')
        .setDescription('📈 Consulte o status e estatísticas da plataforma (Apenas Staff).'),
    new SlashCommandBuilder()
        .setName('ajuda')
        .setDescription('❓ Exibe o Módulo de Ajuda e Comandos da Intell Zyro.'),
    new SlashCommandBuilder()
        .setName('vincular')
        .setDescription('🔗 Redireciona para o OAuth da Zyro Store para vínculo Discord-Site.'),
].map(command => command.toJSON());

client.on('ready', async () => {
    console.log(`🤖 [Zyro Bot v2] Online como ${client.user?.tag}`);
    client.user?.setActivity("Zyro Ecosystem", { type: 3 });

    if (process.env.BOT_API_KEY && CLIENT_ID) {
        const rest = new REST({ version: '10' }).setToken(process.env.BOT_API_KEY);
        try {
            console.log('🔄 Atualizando Slash Commands (System V2)...');
            await rest.put(
                Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
                { body: commands },
            );
            console.log('✅ Base de dados Global/Guild atualizada com sucesso.');
        } catch (error) {
            console.error('❌ Descarga de Slash falhou:', error);
        }
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName } = interaction;

    // Função construtora do cabecalho e rodapé V2
    const buildV2Embed = (title: string | null, description?: string, color: number = COLORS.primary) => {
        const embed = new EmbedBuilder()
            .setAuthor({ name: '► Zyro Solutions ‹', iconURL: client.user?.displayAvatarURL() })
            .setColor(color)
            .setTimestamp()
            .setFooter({ text: `Requisição por ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() });

        if (title) embed.setTitle(title);
        if (description) embed.setDescription(description);
        return embed;
    };

    if (commandName === 'vincular') {
        const btnRow = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('Vincular Conta via Dashboard')
                    .setStyle(ButtonStyle.Link)
                    .setURL('http://localhost:3000/') // Update this URL when deploying!
            );
        const embed = buildV2Embed('🔗 Vínculo com a Zyro', 'Para ativar seu cargo e acessar seus produtos, faça o pareamento do seu Discord com nossa estrutura logando no painel oficial!');
        await interaction.reply({ embeds: [embed], components: [btnRow], ephemeral: true });
    }

    if (commandName === 'ajuda') {
        const embed = buildV2Embed('SISTEMA DE MÓDULOS DE COMANDO')
            .setDescription(
                'Confira abaixo nossa lista de comandos.\n\n' +
                '👤 **`/perfil`** `(`*Exibe seus dados e licenças*`)`\n' +
                '🔑 **`/keys`** `(`*Receba suas licenças ativas na DM*`)`\n' +
                '💻 **`/hwid reset`** `(`*Liberação de Hardware ID da sua máquina*`)`\n' +
                '📈 **`/status`** `(`*Monitor de Infraestrutura - STAFF*`)`\n' +
                '🔗 **`/vincular`** `(`*Pareamento conta Discord e Painel*`)`\n'
            );

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }

    if (commandName === 'perfil') {
        await interaction.deferReply();
        const targetUser = interaction.options.getUser('usuario') || interaction.user;

        try {
            const user = db.prepare('SELECT * FROM users WHERE discord_id = ?').get(targetUser.id) as any;

            if (!user) {
                const embedError = buildV2Embed('❌ ALERTA DO SISTEMA')
                    .setDescription(`**${targetUser.username}** não se encontra registrado em nossa malha de dados (Database). Realize o login no site via Discord para sincronizar.`)
                    .setColor(COLORS.danger);
                await interaction.editReply({ embeds: [embedError] });
                return;
            }

            const activeLicenses = db.prepare(`
                SELECT up.*, p.name 
                FROM user_products up 
                JOIN products p ON up.product_id = p.id 
                WHERE up.user_id = ? AND up.status = 'active'
            `).all(user.id) as any[];

            let desc = `Detalhes de Perfil e Registro Operacional\n\n`;
            desc += `👤 **Membro:** <@${user.discord_id}> \`( ${user.discord_id} )\n\``;
            desc += `🆔 **DB ID:** \`( ${user.id} )\n\``;
            desc += `✈️ **Status:** ${activeLicenses.length > 0 ? '🟢 Ativo' : '🔴 Inativo'}\n`;
            desc += `📅 **Data de Conexão:** \`${new Date(user.created_at).toLocaleString('pt-BR')}\`\n\n`;

            if (activeLicenses.length > 0) {
                desc += `**Seu Inventário Ativo (${activeLicenses.length}):**\n`;
                desc += activeLicenses.map((l: any) => `> 📦 \`${l.name}\` — Expira: \`${l.expires_at ? new Date(l.expires_at).toLocaleDateString('pt-BR') : 'Sem Validade'}\``).join('\n');
            } else {
                desc += `**Nenhum Produto Ativo neste Usuário.**`;
            }

            const embed = buildV2Embed(null)
                .setDescription(desc)
                .setThumbnail(user.avatar || 'https://cdn.discordapp.com/embed/avatars/0.png');

            await interaction.editReply({ embeds: [embed] });
        } catch (e) {
            console.error(e);
            await interaction.editReply({ content: '❌ Houve um erro interno ao processar sua requisição.' });
        }
    }

    if (commandName === 'keys') {
        await interaction.deferReply({ ephemeral: true });
        try {
            const user = db.prepare('SELECT * FROM users WHERE discord_id = ?').get(interaction.user.id) as any;

            if (!user) {
                await interaction.editReply({ content: '❌ Você não está registrado na Zyro Store.' });
                return;
            }

            const activeLicenses = db.prepare(`
                SELECT up.*, p.name 
                FROM user_products up 
                JOIN products p ON up.product_id = p.id 
                WHERE up.user_id = ? AND up.status = 'active'
            `).all(user.id) as any[];

            if (activeLicenses.length === 0) {
                await interaction.editReply({ content: '❌ Você não possui contratos/licenças ativas no momento.' });
                return;
            }

            let desc = `Confidencial: Suas Credenciais Ativas\n**Não compartilhe com ninguém.**\n\n`;
            desc += `👤 **Membro:** <@${user.discord_id}> \`( ${user.discord_id} )\`\n`;
            desc += `📅 **Gerado em:** \`${new Date().toLocaleString('pt-BR')}\`\n\n`;

            activeLicenses.forEach((l: any) => {
                const hwidStatus = l.hwid ? '🔴 `TRAVADO/ATTACHED`' : '🟢 `LIVRE`';
                desc += `**Plataforma: ${l.name}**\n`;
                desc += `> 🔑 \`${l.license_key}\`\n`;
                desc += `> 🛡️ Trabalhando com HWID: ${hwidStatus}\n`;
                desc += `> ⏳ Válido até: \`${l.expires_at ? new Date(l.expires_at).toLocaleDateString('pt-BR') : 'INFINITO'}\`\n\n`;
            });

            const embed = buildV2Embed(null).setDescription(desc);

            await interaction.user.send({ embeds: [embed] });
            const repEmbed = buildV2Embed('MÓDULO DE SEGURANÇA').setDescription('✅ **Comando executado!** Enviamos as suas Licenças Ativas para o seu Privado (DM) com segurança.').setColor(COLORS.success);
            await interaction.editReply({ embeds: [repEmbed] });

        } catch (e) {
            console.error(e);
            await interaction.editReply({ content: '❌ Falha no envio. O seu modo "Privado" (DM) pode estar fechado neste servidor.' });
        }
    }

    if (commandName === 'hwid') {
        const subCommand = interaction.options.getSubcommand();
        if (subCommand === 'reset') {
            await interaction.deferReply({ ephemeral: true });
            try {
                const user = db.prepare('SELECT * FROM users WHERE discord_id = ?').get(interaction.user.id) as any;
                if (!user) {
                    await interaction.editReply({ content: '❌ Acesse o Painel Oficial primeiro!' });
                    return;
                }

                // Reseta HWIDs
                db.prepare('UPDATE user_products SET hwid = NULL WHERE user_id = ?').run(user.id);

                const repEmbed = buildV2Embed('LIBERAÇÃO DE MÁQUINA (HWID)')
                    .setDescription('👤 **Membro:** <@' + interaction.user.id + '>\n✈️ **Status de Liberação:** ✅ Concluído\n📅 **Data:** `' + new Date().toLocaleString('pt-BR') + '`\n\nTodos os Identificadores de Máquina (HWID) atrelados à sua conta foram depurados com sucesso.\nVocê já pode efetuar o Login (Injection) a partir de um novo PC.')
                    .setColor(COLORS.success);

                await interaction.editReply({ embeds: [repEmbed] });
            } catch (e) {
                console.error(e);
                await interaction.editReply({ content: '❌ Erro crítico no banco de dados. Contate a diretoria.' });
            }
        }
    }

    if (commandName === 'status') {
        await interaction.deferReply();
        const isAdmin = db.prepare('SELECT * FROM admin_whitelist WHERE discord_id = ?').get(interaction.user.id);
        if (!isAdmin && interaction.user.id !== '1249488594414997676') {
            await interaction.editReply({ content: '❌ **NEGADO:** Operação restrita ao Pessoal Superior.' });
            return;
        }

        try {
            const dbUsers = db.prepare('SELECT COUNT(*) as count FROM users').get() as any;
            const activeLicenses = db.prepare(`SELECT COUNT(*) as count FROM user_products WHERE status = 'active'`).get() as any;
            const allSales = db.prepare('SELECT COUNT(*) as count FROM user_products').get() as any;

            const guildId = '1435379479739371603';
            const guild = client.guilds.cache.get(guildId);
            const discordMembers = guild ? guild.memberCount : 'Offline';
            const ping = client.ws.ping;

            let desc = `Inteligência e Coleta de Métricas\n\n`;
            desc += `👤 **Autorizado por:** <@${interaction.user.id}>\n`;
            desc += `📡 **Ping API:** \`${ping}ms\`\n`;
            desc += `📅 **Data Local:** \`${new Date().toLocaleString('pt-BR')}\`\n\n`;
            desc += `**Resultados da Pesquisa:**\n`;
            desc += `> 👥 Discord Metrópole: \`${discordMembers} Membros\`\n`;
            desc += `> 🌍 Contas DB Restritas: \`${dbUsers.count} Usuários\`\n`;
            desc += `> ✅ Contratos Ativos On: \`${activeLicenses.count} Licenças\`\n`;
            desc += `> 💰 Volume de Vendas Lidas: \`${allSales.count} Total\`\n`;

            const embed = buildV2Embed(null).setDescription(desc);

            await interaction.editReply({ embeds: [embed] });
        } catch (e) {
            console.error(e);
            await interaction.editReply({ content: 'Erro temporário.' });
        }
    }
});

const BOT_TOKEN = process.env.BOT_API_KEY;

if (BOT_TOKEN && BOT_TOKEN.trim() !== '') {
    client.login(BOT_TOKEN).catch(e => console.error('Discord login erro:', e));
} else {
    console.error('⚠️ BOT_API_KEY não definida no arquivo .env.');
    process.exit(1);
}
