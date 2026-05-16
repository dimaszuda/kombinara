/**
 * Real-time alert ke Discord atau Slack saat ada error kritis di auth.
 * Konfigurasi via env:
 *   DISCORD_WEBHOOK_URL  — webhook Discord
 *   SLACK_WEBHOOK_URL    — webhook Slack
 *
 * Fire-and-forget: tidak pernah throw, tidak pernah memblokir response.
 */

interface AlertParams {
  title: string;
  message?: string;
  route?: string;
  error?: string;
  meta?: Record<string, unknown>;
}

async function sendDiscordAlert(webhookUrl: string, params: AlertParams): Promise<void> {
  const env = process.env.NODE_ENV ?? "unknown";
  const timestamp = new Date().toISOString();

  const fields: { name: string; value: string; inline?: boolean }[] = [
    { name: "Environment", value: env, inline: true },
    { name: "Timestamp", value: timestamp, inline: true },
  ];

  if (params.route) {
    fields.push({ name: "Route", value: `\`${params.route}\``, inline: false });
  }
  if (params.message) {
    fields.push({ name: "Detail", value: params.message.slice(0, 500), inline: false });
  }
  if (params.error) {
    fields.push({
      name: "Error",
      value: `\`\`\`${params.error.slice(0, 900)}\`\`\``,
      inline: false,
    });
  }
  if (params.meta) {
    fields.push({
      name: "Context",
      value: `\`\`\`json\n${JSON.stringify(params.meta, null, 2).slice(0, 450)}\`\`\``,
      inline: false,
    });
  }

  await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      embeds: [
        {
          title: `🚨 ${params.title}`,
          color: 0xff0000,
          fields,
          footer: { text: "Kombinara Auth Monitor" },
        },
      ],
    }),
  });
}

async function sendSlackAlert(webhookUrl: string, params: AlertParams): Promise<void> {
  const env = process.env.NODE_ENV ?? "unknown";
  const timestamp = new Date().toISOString();

  const lines = [
    `*🚨 ${params.title}*`,
    `*Environment:* ${env}  |  *Time:* ${timestamp}`,
    params.route ? `*Route:* \`${params.route}\`` : "",
    params.message ? `*Detail:* ${params.message.slice(0, 500)}` : "",
    params.error
      ? `*Error:*\n\`\`\`${params.error.slice(0, 900)}\`\`\``
      : "",
    params.meta
      ? `*Context:*\n\`\`\`${JSON.stringify(params.meta, null, 2).slice(0, 450)}\`\`\``
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: lines }),
  });
}

/** Kirim alert ke Discord dan/atau Slack. Fire-and-forget — tidak pernah throw. */
export function sendAlert(params: AlertParams): void {
  const discordUrl = process.env.DISCORD_WEBHOOK_URL;
  const slackUrl = process.env.SLACK_WEBHOOK_URL;

  if (!discordUrl && !slackUrl) return;

  const send = async () => {
    try {
      if (discordUrl) await sendDiscordAlert(discordUrl, params);
      if (slackUrl) await sendSlackAlert(slackUrl, params);
    } catch {
      // Jangan sampai kegagalan alert mengcrash app
    }
  };

  send(); // fire and forget
}
