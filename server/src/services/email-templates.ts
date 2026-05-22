import { CreateQuoteDTO, CreateContactDTO } from '../types';

const BRAND_COLOR = '#FF6B2C';
const SECONDARY_COLOR = '#1A1A1A';
const TEXT_COLOR = '#333333';
const LIGHT_GRAY = '#F8F9FA';
const BORDER_COLOR = '#E9ECEF';

/**
 * Common layout wrapper for all emails (French Default)
 */
const emailLayout = (content: string, previewText: string) => `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>KeyPro Service Center</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: ${TEXT_COLOR}; margin: 0; padding: 0; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
    .header { background: ${SECONDARY_COLOR}; padding: 30px 20px; text-align: center; }
    .logo { color: ${BRAND_COLOR}; font-size: 28px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; text-decoration: none; }
    .logo span { color: #ffffff; }
    .content { padding: 40px 30px; }
    .footer { background: ${LIGHT_GRAY}; padding: 30px; text-align: center; color: #777; font-size: 13px; border-top: 1px solid ${BORDER_COLOR}; }
    .button { display: inline-block; padding: 14px 28px; background-color: ${BRAND_COLOR}; color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; text-transform: uppercase; letter-spacing: 1px; }
    .highlight { color: ${BRAND_COLOR}; font-weight: bold; }
    .card { background: ${LIGHT_GRAY}; border: 1px solid ${BORDER_COLOR}; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .label { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #888; margin-bottom: 4px; display: block; }
    .value { font-size: 16px; font-weight: 600; color: ${SECONDARY_COLOR}; }
    .divider { height: 1px; background: ${BORDER_COLOR}; margin: 20px 0; }
    .badge { display: inline-block; padding: 4px 10px; background: ${BRAND_COLOR}20; color: ${BRAND_COLOR}; border-radius: 4px; font-size: 12px; font-weight: bold; margin-bottom: 15px; }
  </style>
</head>
<body>
  <div style="display: none; max-height: 0px; overflow: hidden;">${previewText}</div>
  <div class="container">
    <div class="header">
      <a href="#" class="logo">KEYPRO<span>SERVICE</span></a>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p style="margin-bottom: 10px;"><strong>KeyPro Service Center</strong><br>Solutions Automobiles Professionnelles & Diagnostics IA</p>
      <div style="margin: 15px 0;">
        <a href="#" style="color: #777; text-decoration: none; margin: 0 10px;">Facebook</a>
        <a href="#" style="color: #777; text-decoration: none; margin: 0 10px;">Instagram</a>
        <a href="#" style="color: #777; text-decoration: none; margin: 0 10px;">LinkedIn</a>
      </div>
      <p style="font-size: 11px;">&copy; ${new Date().getFullYear()} KeyPro Service. Tous droits réservés.<br>Ceci est un message automatique, merci de ne pas y répondre directement.</p>
    </div>
  </div>
</body>
</html>
`;

export const templates = {
  /**
   * Quote confirmation for the customer (French)
   */
  quoteConfirmation: (quote: CreateQuoteDTO, dashboardUrl: string) => {
    const previewText = `Nous avons bien reçu votre demande de devis pour votre ${quote.brand} ${quote.model}.`;
    const content = `
      <div class="badge">DEVIS REÇU</div>
      <h1 style="margin-top: 0; color: ${SECONDARY_COLOR}; font-size: 24px;">Bonjour ${quote.name},</h1>
      <p>Merci d'avoir choisi <span class="highlight">KeyPro Service</span>. Nous avons bien reçu votre demande de devis pour votre véhicule.</p>
      <p>Nos techniciens experts examinent actuellement vos détails et vous fourniront une estimation personnalisée sous 24 à 48 heures.</p>
      
      <div class="card">
        <h3 style="margin-top: 0; font-size: 14px; text-transform: uppercase; color: #555;">Résumé de la demande</h3>
        <div style="display: flex; flex-wrap: wrap; margin-bottom: 15px;">
          <div style="flex: 1; min-width: 140px; margin-bottom: 15px;">
            <span class="label">Véhicule</span>
            <span class="value">${quote.year} ${quote.brand} ${quote.model}</span>
          </div>
          <div style="flex: 1; min-width: 140px; margin-bottom: 15px;">
            <span class="label">Type de Service</span>
            <span class="value">${quote.serviceType}</span>
          </div>
        </div>
        <div>
          <span class="label">Lieu</span>
          <span class="value">${quote.location || 'À l\'atelier'}</span>
        </div>
        <div class="divider"></div>
        <span class="label">Description</span>
        <p style="margin: 5px 0; font-style: italic; color: #666; font-size: 14px;">"${quote.description || quote.message || 'Aucun détail supplémentaire fourni'}"</p>
      </div>

      <p>Vous pouvez suivre l'avancement de votre demande et communiquer avec notre équipe via votre tableau de bord personnel.</p>
      
      <div style="text-align: center;">
        <a href="${dashboardUrl}" class="button">Accéder à mon tableau de bord</a>
      </div>

      <p style="font-size: 14px; color: #666;">Si vous avez des questions urgentes, n'hésitez pas à nous appeler au <span class="highlight">+33 (0) 1 23 45 67 89</span>.</p>
    `;
    return emailLayout(content, previewText);
  },

  /**
   * Contact confirmation for the customer (French)
   */
  contactConfirmation: (contact: CreateContactDTO) => {
    const previewText = `Nous avons reçu votre message : ${contact.subject || contact.topic || 'Demande générale'}`;
    const content = `
      <div class="badge">MESSAGE REÇU</div>
      <h1 style="margin-top: 0; color: ${SECONDARY_COLOR}; font-size: 24px;">Bonjour ${contact.name},</h1>
      <p>Merci d'avoir contacté <span class="highlight">KeyPro Service</span>. Ceci est une confirmation automatique que nous avons bien reçu votre demande concernant <strong>"${contact.subject || contact.topic || 'Demande générale'}"</strong>.</p>
      
      <p>Un membre de notre équipe d'assistance examinera votre message et vous répondra dès que possible, généralement sous un jour ouvré.</p>
      
      <div class="card">
        <span class="label">Votre Message</span>
        <p style="margin: 10px 0; color: #555; line-height: 1.5;">${contact.message}</p>
      </div>

      <p>En attendant, vous trouverez peut-être des réponses à vos questions dans notre <a href="#" style="color: ${BRAND_COLOR};">section FAQ</a> ou en visitant notre site web.</p>
      
      <p>Cordialement,<br><strong>L'équipe KeyPro</strong></p>
    `;
    return emailLayout(content, previewText);
  },

  /**
   * Admin notification for new quote (Admin usually in FR/EN but keeping it consistent with user default)
   */
  adminQuoteNotification: (quote: CreateQuoteDTO, adminUrl: string) => {
    const previewText = `Nouvelle demande de devis : ${quote.brand} ${quote.model} - ${quote.serviceType}`;
    const content = `
      <div class="badge" style="background: #EBF8FF; color: #2B6CB0;">ACTION REQUISE</div>
      <h1 style="margin-top: 0; color: ${SECONDARY_COLOR}; font-size: 22px;">Nouvelle Demande de Devis</h1>
      
      <div class="card" style="border-left: 4px solid ${BRAND_COLOR};">
        <div style="margin-bottom: 20px;">
          <span class="label">Informations Client</span>
          <p style="margin: 5px 0;"><strong>${quote.name || 'Inconnu'}</strong></p>
          <p style="margin: 0; font-size: 14px;">${quote.email || 'Pas d\'email fourni'}</p>
          <p style="margin: 0; font-size: 14px;">${quote.phone || 'Pas de téléphone fourni'}</p>
        </div>
        
        <div class="divider"></div>
        
        <div style="margin-bottom: 20px;">
          <span class="label">Détails du Véhicule</span>
          <p style="margin: 5px 0;"><strong>${quote.year} ${quote.brand} ${quote.model}</strong></p>
          <p style="margin: 0; font-size: 14px;">VIN: ${quote.vin || 'Non fourni'}</p>
        </div>

        <div style="margin-bottom: 20px;">
          <span class="label">Service Demandé</span>
          <p style="margin: 5px 0;"><span style="background: ${BRAND_COLOR}; color: white; padding: 2px 8px; border-radius: 3px; font-size: 12px; font-weight: bold;">${quote.serviceType.toUpperCase()}</span></p>
          <p style="margin: 5px 0; font-size: 14px;"><strong>Lieu :</strong> ${quote.location || 'Non spécifié'}</p>
          <p style="margin: 5px 0; font-size: 14px;"><strong>Urgence :</strong> ${quote.urgency || 'Normal'}</p>
        </div>

        <div class="divider"></div>
        
        <span class="label">Description</span>
        <p style="margin: 5px 0; font-size: 14px; background: #fff; padding: 10px; border: 1px solid ${BORDER_COLOR}; border-radius: 4px;">${quote.description || quote.message || 'Aucune description'}</p>
      </div>

      <div style="text-align: center;">
        <a href="${adminUrl}" class="button">Examiner dans le Panneau Admin</a>
      </div>
    `;
    return emailLayout(content, previewText);
  },

  /**
   * Admin notification for new contact message
   */
  adminContactNotification: (contact: CreateContactDTO, adminUrl: string) => {
    const previewText = `Nouveau message de ${contact.name} : ${contact.subject || contact.topic}`;
    const content = `
      <div class="badge" style="background: #EBF8FF; color: #2B6CB0;">DEMANDE</div>
      <h1 style="margin-top: 0; color: ${SECONDARY_COLOR}; font-size: 22px;">Nouveau Message de Contact</h1>
      
      <div class="card">
        <div style="margin-bottom: 15px;">
          <span class="label">De</span>
          <p style="margin: 5px 0;"><strong>${contact.name}</strong> (${contact.email})</p>
          ${contact.phone ? `<p style="margin: 0; font-size: 14px;">Tél : ${contact.phone}</p>` : ''}
        </div>
        
        <div style="margin-bottom: 15px;">
          <span class="label">Sujet</span>
          <p style="margin: 5px 0;"><strong>${contact.subject || contact.topic || 'Demande générale'}</strong></p>
        </div>

        <div class="divider"></div>
        
        <span class="label">Message</span>
        <p style="margin: 5px 0; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${contact.message}</p>
      </div>

      <div style="text-align: center;">
        <a href="${adminUrl}" class="button" style="background-color: ${SECONDARY_COLOR};">Répondre au Message</a>
      </div>
    `;
    return emailLayout(content, previewText);
  },

  /**
   * Quote status update for the customer (French)
   */
  quoteStatusUpdate: (name: string, quote: any, dashboardUrl: string) => {
    const statusText = quote.status.toLowerCase();
    const previewText = `Mise à jour de votre demande : Votre demande est maintenant ${statusText}.`;
    
    let statusMessage = '';
    let actionText = 'Voir les détails';
    
    switch (quote.status) {
      case 'REVIEWING':
        statusMessage = 'Un technicien examine actuellement votre demande et prépare une estimation.';
        break;
      case 'APPROVED':
        statusMessage = `Bonne nouvelle ! Votre demande a été approuvée. ${quote.estimatedPrice ? `Notre prix estimé est de <strong>€${quote.estimatedPrice}</strong>.` : ''}`;
        actionText = 'Voir l\'estimation';
        break;
      case 'REJECTED':
        statusMessage = 'Malheureusement, nous ne sommes pas en mesure de répondre à votre demande pour le moment.';
        break;
      default:
        statusMessage = `Le statut de votre demande a été mis à jour : <strong>${quote.status}</strong>.`;
    }

    const content = `
      <div class="badge">MISE À JOUR</div>
      <h1 style="margin-top: 0; color: ${SECONDARY_COLOR}; font-size: 24px;">Bonjour ${name},</h1>
      <p>Il y a du nouveau concernant votre demande de service pour votre véhicule <span class="highlight">${quote.brand} ${quote.model}</span>.</p>
      
      <div class="card" style="border-left: 4px solid ${quote.status === 'APPROVED' ? '#10B981' : quote.status === 'REJECTED' ? '#EF4444' : BRAND_COLOR};">
        <p style="margin: 0; font-size: 16px;">${statusMessage}</p>
        ${quote.adminNotes ? `
        <div style="margin-top: 15px; padding: 15px; background: #fff; border-radius: 4px; border: 1px dashed ${BORDER_COLOR};">
          <span class="label">Note du Technicien</span>
          <p style="margin: 5px 0 0 0; font-style: italic; color: #555;">"${quote.adminNotes}"</p>
        </div>
        ` : ''}
      </div>

      <p>Merci de vous connecter à votre tableau de bord pour consulter tous les détails ou prendre les mesures nécessaires.</p>
      
      <div style="text-align: center;">
        <a href="${dashboardUrl}" class="button">${actionText}</a>
      </div>

      <p>Merci d'avoir choisi KeyPro Service.</p>
    `;
    return emailLayout(content, previewText);
  },

  /**
   * Admin reply to contact message (French)
   */
  contactReply: (name: string, originalSubject: string, reply: string, dashboardUrl: string) => {
    const previewText = `Nouvelle réponse de KeyPro Service concernant : ${originalSubject || 'Votre demande'}`;
    const content = `
      <div class="badge">NOUVEAU MESSAGE</div>
      <h1 style="margin-top: 0; color: ${SECONDARY_COLOR}; font-size: 24px;">Bonjour ${name},</h1>
      <p>Notre équipe a examiné votre demande et vous a envoyé une réponse :</p>
      
      <div class="card" style="border-left: 4px solid ${SECONDARY_COLOR};">
        <span class="label">Réponse de KeyPro</span>
        <div style="margin: 10px 0; color: ${TEXT_COLOR}; line-height: 1.6; white-space: pre-wrap;">${reply}</div>
      </div>

      <p>Vous pouvez consulter tout l'historique de la conversation dans votre tableau de bord.</p>
      
      <div style="text-align: center;">
        <a href="${dashboardUrl}" class="button">Voir la Conversation</a>
      </div>

      <p>Cordialement,<br><strong>L'équipe KeyPro</strong></p>
    `;
    return emailLayout(content, previewText);
  },

  /**
   * Invoice sent notification for customer (French)
   */
  invoiceNotification: (invoice: any) => {
    const previewText = `Votre facture ${invoice.invoiceNumber} est prête`;
    const content = `
      <div class="badge">FACTURE</div>
      <h1 style="margin-top: 0; color: ${SECONDARY_COLOR}; font-size: 24px;">Bonjour ${invoice.user?.firstName || invoice.quote?.name || 'Client'},</h1>
      <p>Votre facture est maintenant disponible pour le service effectué sur votre <span class="highlight">${invoice.quote?.brand} ${invoice.quote?.model}</span>.</p>

      <div class="card" style="border-left: 4px solid ${BRAND_COLOR};">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <div>
            <span class="label">Numéro de Facture</span>
            <p style="margin: 5px 0; font-size: 20px; font-weight: bold;">${invoice.invoiceNumber}</p>
          </div>
          <div style="text-align: right;">
            <span class="label">Date d'échéance</span>
            <p style="margin: 5px 0; font-size: 16px; font-weight: bold;">${new Date(invoice.dueDate).toLocaleDateString('fr-FR')}</p>
          </div>
        </div>

        <div class="divider"></div>

        <div style="background: ${SECONDARY_COLOR}; color: white; padding: 20px; border-radius: 8px; text-align: center;">
          <span class="label" style="color: #aaa;">Montant Total</span>
          <p style="margin: 5px 0 0 0; font-size: 32px; font-weight: bold;">€${invoice.total.toFixed(2)}</p>
        </div>

        ${invoice.notes ? `
        <div style="margin-top: 15px;">
          <span class="label">Notes</span>
          <p style="margin: 5px 0; color: #666; font-style: italic;">${invoice.notes}</p>
        </div>
        ` : ''}
      </div>

      <p>Vous pouvez consulter et télécharger votre facture depuis votre tableau de bord.</p>

      <div style="text-align: center;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/invoices" class="button">Voir ma facture</a>
      </div>

      <p style="font-size: 13px; color: #666;">Modes de paiement acceptés : Espèces, Carte bancaire, Virement, Chèque</p>
    `;
    return emailLayout(content, previewText);
  },

  /**
   * Payment confirmation for customer (French)
   */
  paymentConfirmation: (invoice: any) => {
    const previewText = `Paiement reçu pour la facture ${invoice.invoiceNumber}`;
    const content = `
      <div class="badge" style="background: #10B981; color: white;">PAYÉ</div>
      <h1 style="margin-top: 0; color: ${SECONDARY_COLOR}; font-size: 24px;">Paiement Confirmé</h1>
      <p>Nous vous confirmons la bonne réception de votre paiement pour la facture <strong>${invoice.invoiceNumber}</strong>.</p>

      <div class="card" style="border-left: 4px solid #10B981;">
        <div style="margin-bottom: 15px;">
          <span class="label">Montant Payé</span>
          <p style="margin: 5px 0; font-size: 28px; font-weight: bold; color: #10B981;">€${invoice.total.toFixed(2)}</p>
        </div>
        <div>
          <span class="label">Mode de Paiement</span>
          <p style="margin: 5px 0; font-size: 16px;">${invoice.paymentMethod}</p>
        </div>
        <div style="margin-top: 10px;">
          <span class="label">Date de Paiement</span>
          <p style="margin: 5px 0; font-size: 14px;">${new Date(invoice.paidAt).toLocaleDateString('fr-FR')}</p>
        </div>
      </div>

      <p>Merci pour votre confiance. Nous restons à votre disposition pour tout service futur.</p>

      <p>Cordialement,<br><strong>L'équipe KeyPro</strong></p>
    `;
    return emailLayout(content, previewText);
  }
};
