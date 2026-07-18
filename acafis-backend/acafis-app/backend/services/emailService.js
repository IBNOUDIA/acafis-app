const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM   = process.env.EMAIL_FROM || 'onboarding@resend.dev';

// ── Convocation AG/CA ──
exports.sendConvocation = async ({ to, name, meeting }) => {
  const date = new Date(meeting.date).toLocaleDateString('fr-FR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  const agendaHTML = meeting.agenda?.map(item =>
    `<tr>
      <td style="padding:8px 12px;border-bottom:1px solid #ede9e0;color:#c9973a;font-weight:700;width:30px;">${item.order}.</td>
      <td style="padding:8px 12px;border-bottom:1px solid #ede9e0;color:#333;">${item.title}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #ede9e0;color:#8a8a8a;text-align:right;">${item.duration ? item.duration + ' min' : ''}</td>
    </tr>`
  ).join('') || '';

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f8f5ef;font-family:'Helvetica Neue',Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;padding:20px;">

  <div style="display:flex;align-items:center;justify-content:center;gap:12px;margin-bottom:8px;">
  <span style="font-size:28px;">🇸🇳</span>
  <h1 style="color:#c9973a;margin:0;font-size:24px;letter-spacing:0.05em;">ACAFIS</h1>
  <span style="font-size:28px;">🇨🇦</span>
</div>
<p style="color:rgba(255,255,255,0.7);margin:0;font-size:13px;">Coopérative d'Habitat — Cité Jardin Ndianda</p>
<p style="color:rgba(255,255,255,0.5);margin:4px 0 0;font-size:11px;">🇸🇳 Sénégal — 🇨🇦 Canada</p>

  <!-- BANDEAU CONVOCATION -->
  <div style="background:#c9973a;padding:14px 24px;text-align:center;">
    <p style="color:#fff;margin:0;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;">
      ✉️ CONVOCATION OFFICIELLE
    </p>
    <h2 style="color:#fff;margin:6px 0 0;font-size:18px;">${meeting.title}</h2>
  </div>

  <!-- CONTENU -->
  <div style="background:#ffffff;padding:32px;border-left:1px solid #ede9e0;border-right:1px solid #ede9e0;">
    <p style="color:#333;font-size:15px;line-height:1.6;margin:0 0 16px;">
      Bonjour <strong>${name}</strong>,
    </p>
    <p style="color:#555;font-size:14px;line-height:1.7;margin:0 0 24px;">
      Au nom du Conseil d'Administration de la <strong>Coopérative d'Habitat ACAFIS</strong>,
      vous êtes convoqué(e) à la prochaine réunion. Votre présence est importante
      pour le bon fonctionnement de notre coopérative.
    </p>

    <!-- INFOS RÉUNION -->
    <div style="background:#f8f5ef;border-radius:10px;padding:20px;margin:0 0 24px;border-left:4px solid #1a3a6b;">
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:8px 0;color:#8a8a8a;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;width:35%;">📅 Date</td>
          <td style="padding:8px 0;color:#1a3a6b;font-size:14px;font-weight:700;">${date}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#8a8a8a;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;">🕐 Heure</td>
          <td style="padding:8px 0;color:#1a3a6b;font-size:14px;font-weight:700;">${meeting.time}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#8a8a8a;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;">⏱️ Durée</td>
          <td style="padding:8px 0;color:#333;font-size:14px;">${meeting.duration} minutes</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#8a8a8a;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;">🔀 Mode</td>
          <td style="padding:8px 0;color:#333;font-size:14px;"><strong>Hybride</strong> — Présentiel + En ligne (Jitsi Meet)</td>
        </tr>
        ${meeting.location ? `
        <tr>
          <td style="padding:8px 0;color:#8a8a8a;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;">🏛️ Lieu</td>
          <td style="padding:8px 0;color:#333;font-size:14px;">${meeting.location}</td>
        </tr>` : ''}
      </table>
    </div>

    <!-- BOUTON JITSI -->
    ${meeting.meetingUrl ? `
    <div style="text-align:center;margin:0 0 24px;">
      <a href="${meeting.meetingUrl}"
        style="background:#1a3a6b;color:#fff;padding:14px 32px;border-radius:8px;
               text-decoration:none;font-weight:700;font-size:15px;display:inline-block;">
        💻 Rejoindre la réunion en ligne
      </a>
      <p style="color:#8a8a8a;font-size:11px;margin:8px 0 0;">
        Lien Jitsi Meet — Cliquez pour rejoindre depuis n'importe quel appareil
      </p>
    </div>` : ''}

    <!-- MODE HYBRIDE -->
    <div style="background:#eaf4ee;border-radius:8px;padding:16px;border-left:4px solid #2d6a4f;margin:0 0 24px;">
      <p style="color:#2d6a4f;font-weight:700;margin:0 0 6px;font-size:13px;">🔀 Participation hybride</p>
      <p style="color:#555;font-size:13px;margin:0;line-height:1.6;">
        Vous pouvez participer <strong>en présentiel</strong> ou <strong>en ligne via Jitsi Meet</strong>.
        Merci de confirmer votre mode de participation en répondant à cet email avant la réunion.
      </p>
    </div>

    <!-- ORDRE DU JOUR -->
    ${agendaHTML ? `
    <h3 style="color:#1a3a6b;font-size:15px;margin:0 0 12px;padding-bottom:8px;border-bottom:2px solid #c9973a;">
      📋 Ordre du jour
    </h3>
    <table style="width:100%;border-collapse:collapse;margin:0 0 24px;">
      ${agendaHTML}
    </table>` : ''}

    <p style="color:#555;font-size:13px;line-height:1.7;margin:0 0 8px;">
      En cas d'empêchement, veuillez nous en informer au plus tôt afin que nous puissions
      prendre les dispositions nécessaires pour le quorum.
    </p>

    <p style="color:#333;font-size:14px;margin:24px 0 0;">
      Cordialement,<br>
      <strong style="color:#1a3a6b;">Le Conseil d'Administration — ACAFIS</strong><br>
      <span style="color:#8a8a8a;font-size:12px;">Omar Sarr, Président</span>
    </p>
  </div>

  <!-- PIED DE PAGE -->
  <div style="background:#1a3a6b;border-radius:0 0 12px 12px;padding:20px;text-align:center;">
    <p style="color:rgba(255,255,255,0.6);font-size:11px;margin:0 0 4px;">
      ACAFIS — Association Canadienne d'Aide à la Famille Immigrante Sénégalaise
    </p>
    <p style="color:rgba(255,255,255,0.6);font-size:11px;margin:0 0 4px;">
      325 Boul. de la Côte-Vertu, app. 407, Saint-Laurent, Montréal, QC H4N 1E4
    </p>
    <p style="margin:8px 0 0;">
      <a href="https://coop-acafis.com" style="color:#c9973a;font-size:11px;">coop-acafis.com</a>
    </p>
  </div>

</div>
</body>
</html>`;

  return await resend.emails.send({
    from: FROM,
    to,
    subject: `📅 CONVOCATION — ${meeting.title} — ${date}`,
    html,
  });
};

// ── Notification vote ──
exports.sendVoteNotification = async ({ to, name, meeting, resolution }) => {
  const html = `
<!DOCTYPE html>
<html lang="fr">
<body style="margin:0;padding:20px;background:#f8f5ef;font-family:Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;">
  <div style="background:#1a3a6b;padding:24px;text-align:center;">
    <h2 style="color:#c9973a;margin:0;">ACAFIS</h2>
    <p style="color:#fff;margin:4px 0 0;font-size:14px;">🗳️ Vote en cours</p>
  </div>
  <div style="padding:24px;">
    <p style="color:#333;">Bonjour <strong>${name}</strong>,</p>
    <p style="color:#555;">Un vote est en cours lors de la réunion <strong>${meeting.title}</strong>.</p>
    <div style="background:#f8f5ef;border-radius:8px;padding:16px;border-left:4px solid #c9973a;margin:16px 0;">
      <p style="color:#c9973a;font-weight:700;margin:0 0 6px;font-size:13px;">📋 Résolution soumise au vote</p>
      <p style="color:#333;font-size:14px;margin:0;font-weight:600;">${resolution.title}</p>
      ${resolution.description ? `<p style="color:#555;font-size:13px;margin:6px 0 0;">${resolution.description}</p>` : ''}
    </div>
    <div style="text-align:center;margin:20px 0;">
      <a href="${process.env.CLIENT_URL}/votes"
        style="background:#c9973a;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:700;">
        🗳️ Accéder au vote
      </a>
    </div>
  </div>
  <div style="background:#1a3a6b;padding:16px;text-align:center;">
    <p style="color:rgba(255,255,255,0.6);font-size:11px;margin:0;">ACAFIS © 2026 — coop-acafis.com</p>
  </div>
</div>
</body>
</html>`;

  return await resend.emails.send({
    from: FROM,
    to,
    subject: `🗳️ VOTE EN COURS — ${meeting.title}`,
    html,
  });
};

// ── PV par email ──
exports.sendMinutes = async ({ to, name, meeting, minutesUrl }) => {
  const date = new Date(meeting.date).toLocaleDateString('fr-FR', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  const html = `
<!DOCTYPE html>
<html lang="fr">
<body style="margin:0;padding:20px;background:#f8f5ef;font-family:Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;">
  <div style="background:#1a3a6b;padding:24px;text-align:center;">
    <h2 style="color:#c9973a;margin:0;">ACAFIS</h2>
    <p style="color:#fff;margin:4px 0 0;font-size:14px;">📄 Procès-Verbal disponible</p>
  </div>
  <div style="padding:24px;">
    <p style="color:#333;">Bonjour <strong>${name}</strong>,</p>
    <p style="color:#555;line-height:1.7;">
      Le procès-verbal de la réunion du <strong>${date}</strong> est maintenant disponible.
      Veuillez en prendre connaissance et nous faire part de vos observations dans un délai de 7 jours.
    </p>
    <div style="text-align:center;margin:24px 0;">
      <a href="${minutesUrl || process.env.CLIENT_URL + '/meetings'}"
        style="background:#1a3a6b;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:700;">
        📄 Télécharger le PV
      </a>
    </div>
    <p style="color:#8a8a8a;font-size:12px;line-height:1.6;">
      Ce PV sera considéré comme approuvé si aucune observation n'est reçue dans les 7 jours suivant cet envoi.
    </p>
  </div>
  <div style="background:#1a3a6b;padding:16px;text-align:center;">
    <p style="color:rgba(255,255,255,0.6);font-size:11px;margin:0;">ACAFIS © 2026 — coop-acafis.com</p>
  </div>
</div>
</body>
</html>`;

  return await resend.emails.send({
    from: FROM,
    to,
    subject: `📄 PROCÈS-VERBAL — ${meeting.title} — ${date}`,
    html,
  });
};