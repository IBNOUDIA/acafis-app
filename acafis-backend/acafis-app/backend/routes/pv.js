const express  = require('express');
const router   = express.Router();
const PDFKit   = require('pdfkit');
const { protect, authorize } = require('../middleware/auth');
const Meeting  = require('../models/Meeting');
const Vote     = require('../models/Vote');
const User     = require('../models/User');

// @desc  Générer PV automatique d'une réunion
// @route GET /api/pv/:meetingId
router.get('/:meetingId', protect, authorize('super_admin', 'admin'), async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.meetingId)
      .populate('attendees.user', 'firstName lastName position role')
      .populate('createdBy', 'firstName lastName position');

    if (!meeting) return res.status(404).json({ success: false, message: 'Réunion introuvable' });

    // Récupérer les votes de cette réunion
    const votes = await Vote.find({ meeting: meeting._id })
      .populate('votes.user', 'firstName lastName');

    // Récupérer tous les membres CA
    const membresCA = await User.find({
      role: { $in: ['super_admin', 'admin', 'admin_finance', 'membre_ca'] },
      isActive: true
    });

    // ── Générer le PDF ──
    const doc = new PDFKit({ size: 'A4', margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="PV_${meeting.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf"`);
    doc.pipe(res);

    const BLUE   = '#1a3a6b';
    const GOLD   = '#c9973a';
    const GRAY   = '#666666';
    const GREEN  = '#2d6a4f';
    const RED    = '#c0392b';

    // ── EN-TÊTE ──
    doc.rect(0, 0, 612, 130).fill(BLUE);
    doc.fillColor(GOLD).fontSize(20).font('Helvetica-Bold')
       .text('COOPÉRATIVE D\'HABITAT ACAFIS', 50, 25, { align: 'center' });
    doc.fillColor('#ffffff').fontSize(13).font('Helvetica')
       .text('PROCÈS-VERBAL DE RÉUNION', 50, 52, { align: 'center' });
    doc.fillColor('rgba(255,255,255,0.7)').fontSize(10)
       .text(meeting.title, 50, 72, { align: 'center' });
    doc.fillColor('rgba(255,255,255,0.5)').fontSize(8)
       .text(`Généré automatiquement le ${new Date().toLocaleDateString('fr-FR')}`, 50, 92, { align: 'center' });

    let y = 150;

    // ── INFORMATIONS RÉUNION ──
    doc.fillColor(BLUE).fontSize(13).font('Helvetica-Bold')
       .text('1. INFORMATIONS GÉNÉRALES', 50, y);
    y += 5;
    doc.moveTo(50, y + 12).lineTo(562, y + 12).strokeColor(GOLD).lineWidth(2).stroke();
    y += 20;

    const infos = [
      ['Type de réunion',  meeting.type?.replace(/_/g, ' ').toUpperCase() || '—'],
      ['Date',             new Date(meeting.date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })],
      ['Heure de début',   meeting.time || '—'],
      ['Durée prévue',     `${meeting.duration} minutes`],
      ['Mode',             meeting.platform || 'Hybride'],
      ['Lieu',             meeting.location || '9100 Boul. Saint-Laurent # 600A, Montréal, QC H2N 1M9'],
      ['Lien en ligne',    meeting.meetingUrl || '—'],
      ['Statut',           meeting.status?.toUpperCase() || '—'],
    ];

    infos.forEach(([label, value], i) => {
      const rowY = y + i * 18;
      doc.rect(50, rowY, 562, 18).fill(i % 2 === 0 ? '#f8f5ef' : '#ffffff');
      doc.fillColor(BLUE).fontSize(9).font('Helvetica-Bold').text(label, 55, rowY + 5);
      doc.fillColor('#333').font('Helvetica').text(value, 220, rowY + 5);
    });
    y += infos.length * 18 + 20;

    // ── PRÉSENCES ──
    doc.fillColor(BLUE).fontSize(13).font('Helvetica-Bold').text('2. PRÉSENCES', 50, y);
    y += 5;
    doc.moveTo(50, y + 12).lineTo(562, y + 12).strokeColor(GOLD).lineWidth(2).stroke();
    y += 20;

    const presents   = meeting.attendees?.filter(a => a.status === 'présent') || [];
    const excuses    = meeting.attendees?.filter(a => a.status === 'excusé') || [];
    const absents    = membresCA.filter(m => !meeting.attendees?.find(a => a.user?._id?.toString() === m._id.toString()));

    doc.fillColor(GREEN).fontSize(10).font('Helvetica-Bold').text(`Présents (${presents.length})`, 55, y);
    y += 14;
    if (presents.length > 0) {
      presents.forEach((a, i) => {
        doc.rect(55, y, 502, 16).fill(i % 2 === 0 ? '#eaf4ee' : '#ffffff');
        doc.fillColor('#333').fontSize(8.5).font('Helvetica')
           .text(`${a.user?.firstName || '—'} ${a.user?.lastName || ''}`, 60, y + 4)
           .fillColor(GRAY).text(a.user?.position || a.user?.role || '—', 300, y + 4);
        y += 16;
      });
    } else {
      doc.fillColor(GRAY).fontSize(9).font('Helvetica').text('Aucun présent enregistré', 60, y);
      y += 16;
    }
    y += 8;

    if (excuses.length > 0) {
      doc.fillColor('#c9973a').fontSize(10).font('Helvetica-Bold').text(`Excusés (${excuses.length})`, 55, y);
      y += 14;
      excuses.forEach((a, i) => {
        doc.rect(55, y, 502, 16).fill(i % 2 === 0 ? '#fdf5e6' : '#ffffff');
        doc.fillColor('#333').fontSize(8.5).font('Helvetica')
           .text(`${a.user?.firstName || '—'} ${a.user?.lastName || ''}`, 60, y + 4);
        y += 16;
      });
      y += 8;
    }

    // ── ORDRE DU JOUR ──
    if (y > 700) { doc.addPage(); y = 50; }
    doc.fillColor(BLUE).fontSize(13).font('Helvetica-Bold').text('3. ORDRE DU JOUR', 50, y);
    y += 5;
    doc.moveTo(50, y + 12).lineTo(562, y + 12).strokeColor(GOLD).lineWidth(2).stroke();
    y += 20;

    meeting.agenda?.forEach((item, i) => {
      if (y > 720) { doc.addPage(); y = 50; }
      doc.rect(50, y, 562, 20).fill(i % 2 === 0 ? '#f8f5ef' : '#ffffff');
      doc.fillColor(GOLD).fontSize(9).font('Helvetica-Bold').text(`${item.order}.`, 55, y + 6);
      doc.fillColor('#333').font('Helvetica').text(item.title, 75, y + 6, { width: 430 });
      if (item.duration) {
        doc.fillColor(GRAY).fontSize(8).text(`${item.duration} min`, 510, y + 6);
      }
      y += 20;
    });
    y += 15;

    // ── DÉLIBÉRATIONS & VOTES ──
    if (votes.length > 0) {
      if (y > 650) { doc.addPage(); y = 50; }
      doc.fillColor(BLUE).fontSize(13).font('Helvetica-Bold').text('4. DÉLIBÉRATIONS ET VOTES', 50, y);
      y += 5;
      doc.moveTo(50, y + 12).lineTo(562, y + 12).strokeColor(GOLD).lineWidth(2).stroke();
      y += 20;

      votes.forEach((vote, i) => {
        if (y > 680) { doc.addPage(); y = 50; }
        const adopte = vote.results?.resultat === 'adoptée';

        doc.rect(50, y, 562, 22).fill(adopte ? '#eaf4ee' : '#fdf0ee');
        doc.rect(50, y, 4, 22).fill(adopte ? GREEN : RED);
        doc.fillColor(BLUE).fontSize(9.5).font('Helvetica-Bold')
           .text(`Résolution ${i + 1} : ${vote.resolution.title}`, 60, y + 7, { width: 420 });
        doc.fillColor(adopte ? GREEN : RED).font('Helvetica-Bold').fontSize(9)
           .text(adopte ? '✓ ADOPTÉE' : '✗ REJETÉE', 490, y + 7);
        y += 22;

        if (vote.resolution.description) {
          doc.fillColor(GRAY).fontSize(8.5).font('Helvetica')
             .text(vote.resolution.description, 60, y + 4, { width: 490 });
          y += 18;
        }

        doc.fillColor(GRAY).fontSize(8).font('Helvetica')
           .text(`Pour : ${vote.results?.pour || 0}  |  Contre : ${vote.results?.contre || 0}  |  Abstentions : ${vote.results?.abstention || 0}  |  Total : ${vote.results?.total || 0} vote(s)`, 60, y + 4);
        y += 20;
      });
      y += 10;
    }

    // ── PV RÉDIGÉ ──
    if (meeting.minutes?.content) {
      if (y > 600) { doc.addPage(); y = 50; }
      doc.fillColor(BLUE).fontSize(13).font('Helvetica-Bold').text('5. CONTENU DU PROCÈS-VERBAL', 50, y);
      y += 5;
      doc.moveTo(50, y + 12).lineTo(562, y + 12).strokeColor(GOLD).lineWidth(2).stroke();
      y += 20;
      doc.fillColor('#333').fontSize(9.5).font('Helvetica')
         .text(meeting.minutes.content, 50, y, { width: 512, align: 'justify' });
      y += doc.heightOfString(meeting.minutes.content, { width: 512 }) + 20;
    }

    // ── SIGNATURES ──
    if (y > 650) { doc.addPage(); y = 50; }
    doc.fillColor(BLUE).fontSize(13).font('Helvetica-Bold')
       .text(meeting.minutes?.content ? '6. SIGNATURES' : '5. SIGNATURES', 50, y);
    y += 5;
    doc.moveTo(50, y + 12).lineTo(562, y + 12).strokeColor(GOLD).lineWidth(2).stroke();
    y += 30;

    const signataires = [
      { role: 'Président', nom: 'Omar Sarr' },
      { role: 'Secrétaire Général', nom: 'Ibra Mbaye' },
      { role: 'Trésorière', nom: 'Bintou Sarr' },
    ];

    signataires.forEach((s, i) => {
      const x = 50 + i * 175;
      doc.fillColor(GRAY).fontSize(9).font('Helvetica').text(s.role, x, y, { width: 160, align: 'center' });
      doc.moveTo(x + 10, y + 50).lineTo(x + 150, y + 50).strokeColor('#ccc').lineWidth(1).stroke();
      doc.fillColor('#333').fontSize(8.5).text(s.nom, x, y + 55, { width: 160, align: 'center' });
    });
    y += 80;

    // ── PIED DE PAGE ──
    doc.rect(0, 780, 612, 62).fill(BLUE);
    doc.fillColor('rgba(255,255,255,0.6)').fontSize(8).font('Helvetica')
       .text('ACAFIS — Association Canadienne d\'Aide à la Famille Immigrante Sénégalaise', 50, 790, { align: 'center' })
       .text('coop-acafis.com  |  infos@coop-acafis.com  |  Montréal, QC, Canada', 50, 804, { align: 'center' })
       .text(`PV généré automatiquement le ${new Date().toLocaleString('fr-FR')} — Confidentiel CA`, 50, 818, { align: 'center' });

    doc.end();

  } catch (err) {
    console.error('PV error:', err);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: 'Erreur génération PV' });
    }
  }
});

module.exports = router;