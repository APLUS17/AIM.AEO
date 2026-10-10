// Report + lead emails, sent through Resend (https://resend.com).

const esc = value =>
  String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);

const VIOLET = '#5f79ff';
const INK = '#000000';
const ASH = '#4d4d4d';
const FOG = '#f5f5f5';

function dimensionRows(score) {
  return score.dimensions
    .map(d => {
      const pct = Math.round((d.points / d.max) * 100);
      return `
        <tr>
          <td style="padding:10px 0;font-size:14px;color:${INK};">${esc(d.name)}</td>
          <td style="padding:10px 0;font-size:14px;color:${ASH};text-align:right;white-space:nowrap;">${esc(d.points)} / ${esc(d.max)}</td>
        </tr>
        <tr>
          <td colspan="2" style="padding:0 0 8px 0;">
            <div style="background:${FOG};border-radius:100px;height:8px;width:100%;">
              <div style="background:${VIOLET};border-radius:100px;height:8px;width:${pct}%;"></div>
            </div>
          </td>
        </tr>`;
    })
    .join('');
}

function list(items) {
  if (!items?.length) return '<p style="margin:0;color:#707070;font-size:14px;">None yet.</p>';
  return `<ul style="margin:0;padding-left:18px;color:${ASH};font-size:14px;line-height:1.6;">${items
    .map(i => `<li>${esc(i)}</li>`)
    .join('')}</ul>`;
}

export function renderReportEmail(report, { siteUrl } = {}) {
  const { input, score, interpretation } = report;
  const sampleBanner =
    report.mode === 'mock'
      ? `<div style="background:#fff4d6;border:1px solid #f0d27a;border-radius:12px;padding:12px 16px;margin-bottom:20px;font-size:13px;color:#6b5200;">
           Sample data: this report was generated in test mode, not from real AI answers.
         </div>`
      : '';
  const skipped = report.skippedEngines.length
    ? `<p style="font-size:12px;color:#707070;margin:8px 0 0 0;">Not checked this time: ${esc(report.skippedEngines.join(', '))}.</p>`
    : '';
  const competitors = score.topCompetitors.length
    ? score.topCompetitors.map(c => `${c.name} (${c.mentions})`)
    : [];
  const cta = siteUrl
    ? `<p style="margin:28px 0 0 0;"><a href="${esc(siteUrl)}" style="background:${VIOLET};color:#fff;text-decoration:none;padding:12px 22px;border-radius:100px;font-size:15px;display:inline-block;">See how we fix it →</a></p>`
    : '';

  const html = `<!doctype html>
<html><body style="margin:0;background:${FOG};font-family:Inter,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${FOG};padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border:1px solid #e6e6e6;border-radius:16px;padding:32px;">
        <tr><td>
          ${sampleBanner}
          <p style="margin:0 0 6px 0;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#00874e;">AI Search Grade</p>
          <h1 style="margin:0 0 4px 0;font-family:Georgia,serif;font-weight:300;font-size:30px;color:${INK};">${esc(input.company)}</h1>
          <p style="margin:0 0 24px 0;font-size:14px;color:#707070;">${esc(input.product)} · ${esc(input.industry)} · ${esc(input.location)}</p>

          <div style="border:1px solid ${INK};border-radius:16px;padding:20px;text-align:center;margin-bottom:24px;">
            <div style="font-family:Georgia,serif;font-size:56px;line-height:1;color:${VIOLET};">${esc(score.total)}</div>
            <div style="font-size:14px;color:${ASH};margin-top:6px;">out of 100 · ${esc(score.band)}</div>
            ${skipped}
          </div>

          <p style="font-size:15px;line-height:1.6;color:${ASH};margin:0 0 24px 0;">${esc(interpretation.summary)}</p>

          <h2 style="font-size:16px;font-weight:500;color:${INK};margin:0 0 4px 0;">Score breakdown</h2>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${dimensionRows(score)}</table>

          <h2 style="font-size:16px;font-weight:500;color:${INK};margin:24px 0 8px 0;">Mention rate by engine</h2>
          ${list(score.engines.map(e => `${e.label}: mentioned in ${e.mentionRate}% of answers`))}

          <h2 style="font-size:16px;font-weight:500;color:${INK};margin:24px 0 8px 0;">Strengths</h2>
          ${list(interpretation.strengths)}

          <h2 style="font-size:16px;font-weight:500;color:${INK};margin:24px 0 8px 0;">Where to improve</h2>
          ${list(interpretation.growth_areas)}

          <h2 style="font-size:16px;font-weight:500;color:${INK};margin:24px 0 8px 0;">Competitors AI names most</h2>
          ${list(competitors)}

          ${cta}

          <p style="font-size:12px;line-height:1.55;color:#707070;margin:28px 0 0 0;">
            Scores come from AI-generated answers at the time of this check and can change between runs.
            Results aren't guaranteed and aren't a substitute for professional advice.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  const prefix = report.mode === 'mock' ? '[Sample data] ' : '';
  return {
    subject: `${prefix}Your AI Search Grade: ${input.company} scored ${score.total}/100`,
    html
  };
}

export function renderLeadEmail(report) {
  const { input, score } = report;
  const prefix = report.mode === 'mock' ? '[Sample data] ' : '';
  const rows = [
    ['Company', input.company],
    ['Email', input.email],
    ['Product', input.product],
    ['Industry', input.industry],
    ['Location', input.location],
    ['Score', `${score.total}/100 (${score.band})`],
    ['Checks', `${report.checks.succeeded}/${report.checks.attempted} succeeded`]
  ];
  return {
    subject: `${prefix}New grader lead: ${input.company} (${score.total}/100)`,
    html: `<table cellpadding="6" style="font-family:Arial,sans-serif;font-size:14px;">${rows
      .map(([k, v]) => `<tr><td style="color:#707070;">${esc(k)}</td><td>${esc(v)}</td></tr>`)
      .join('')}</table>`
  };
}

export async function sendEmail({ to, subject, html, replyTo }, env) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.RESEND_API_KEY}`
    },
    body: JSON.stringify({
      from: env.FROM_EMAIL,
      to: [to],
      subject,
      html,
      ...(replyTo ? { reply_to: replyTo } : {})
    }),
    signal: AbortSignal.timeout(30_000)
  });
  if (!res.ok) {
    throw new Error(`Resend returned ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }
  return res.json();
}

export function canSendEmail(env) {
  return Boolean(env.RESEND_API_KEY && env.FROM_EMAIL);
}
