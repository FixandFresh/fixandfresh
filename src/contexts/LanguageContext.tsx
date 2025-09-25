import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

type Language = 'en' | 'es' | 'fr' | 'pt';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('language');
      if (saved && ['en', 'es', 'fr', 'pt'].includes(saved)) {
        return saved as Language;
      }
    } catch (e) {
      console.warn('Could not access localStorage');
    }
    const browserLang = navigator.language.split('-')[0];
    return ['en', 'es', 'fr', 'pt'].includes(browserLang) ? browserLang as Language : 'en';
  });

  useEffect(() => {
    try {
      localStorage.setItem('language', language);
    } catch (e) {
      console.warn('Could not save to localStorage');
    }
  }, [language]);

  const translations = {
    en: {
      'app.title': 'Fix & Fresh',
      'nav.logout': 'Logout',
      'nav.hello': 'Hello',
      'search.placeholder': 'Search services...',
      'dashboard.title': 'Dashboard',
      'dashboard.createJob': 'Create Job',
      'dashboard.myJobs': 'My Jobs',
      'dashboard.availableJobs': 'Available Jobs',
      'dashboard.earnings': 'Earnings',
      'dashboard.wallet': 'Wallet',
      'dashboard.transactions': 'Transactions',
      'dashboard.withdraw': 'Withdraw',
      'dashboard.balance': 'Balance',
      'dashboard.totalEarnings': 'Total Earnings',
      'dashboard.pendingPayments': 'Pending Payments',
      'dashboard.completedJobs': 'Completed Jobs',
      'job.status.scheduled': 'Scheduled',
      'job.status.enRoute': 'En Route',
      'job.status.inProgress': 'In Progress',
      'job.status.completed': 'Completed',
      'job.status.cancelled': 'Cancelled',
      'auth.login': 'Login',
      'auth.register': 'Register',
      'auth.email': 'Email',
      'auth.password': 'Password',
      'auth.name': 'Name',
      'language.select': 'Select Language',
      'language.english': 'English',
      'language.spanish': 'Spanish',
      'language.french': 'French',
      'language.portuguese': 'Portuguese',
      'services.plumbing': 'Plumbing',
      'services.electrical': 'Electrical',
      'services.hvac': 'HVAC',
      'services.carpentry': 'Carpentry',
      'services.painting': 'Painting',
      'services.cleaning': 'Cleaning',
      'services.select': 'Select Service',
      'services.addOn': 'Add-On',
      'services.market': 'Market Price',
      'job.viewDetails': 'View Details',
      'job.accept': 'Accept Job',
      'job.complete': 'Complete Job',
      'job.cancel': 'Cancel Job',
      'job.location': 'Location',
      'job.description': 'Description',
      'job.price': 'Price',
      'job.date': 'Date',
      'job.bookService': 'Book Service',
      'job.payNow': 'Pay Now',
      'form.submit': 'Submit',
      'form.cancel': 'Cancel',
      'common.loading': 'Loading...',
      'common.error': 'Error',
      'common.success': 'Success'
    },
    es: {
      'app.title': 'Fix & Fresh',
      'nav.logout': 'Cerrar Sesión',
      'nav.hello': 'Hola',
      'search.placeholder': 'Buscar servicios...',
      'dashboard.title': 'Panel de Control',
      'dashboard.createJob': 'Crear Trabajo',
      'dashboard.myJobs': 'Mis Trabajos',
      'dashboard.availableJobs': 'Trabajos Disponibles',
      'dashboard.earnings': 'Ganancias',
      'dashboard.wallet': 'Billetera',
      'dashboard.transactions': 'Transacciones',
      'dashboard.withdraw': 'Retirar',
      'dashboard.balance': 'Saldo',
      'dashboard.totalEarnings': 'Ganancias Totales',
      'dashboard.pendingPayments': 'Pagos Pendientes',
      'dashboard.completedJobs': 'Trabajos Completados',
      'job.status.scheduled': 'Programado',
      'job.status.enRoute': 'En Camino',
      'job.status.inProgress': 'En Progreso',
      'job.status.completed': 'Completado',
      'job.status.cancelled': 'Cancelado',
      'auth.login': 'Iniciar Sesión',
      'auth.register': 'Registrarse',
      'auth.email': 'Correo Electrónico',
      'auth.password': 'Contraseña',
      'auth.name': 'Nombre',
      'language.select': 'Seleccionar Idioma',
      'language.english': 'Inglés',
      'language.spanish': 'Español',
      'language.french': 'Francés',
      'language.portuguese': 'Portugués',
      'services.plumbing': 'Plomería',
      'services.electrical': 'Eléctrico',
      'services.hvac': 'Climatización',
      'services.carpentry': 'Carpintería',
      'services.painting': 'Pintura',
      'services.cleaning': 'Limpieza',
      'services.select': 'Seleccionar Servicio',
      'services.addOn': 'Complemento',
      'services.market': 'Precio de Mercado',
      'job.viewDetails': 'Ver Detalles',
      'job.accept': 'Aceptar Trabajo',
      'job.complete': 'Completar Trabajo',
      'job.cancel': 'Cancelar Trabajo',
      'job.location': 'Ubicación',
      'job.description': 'Descripción',
      'job.price': 'Precio',
      'job.date': 'Fecha',
      'job.bookService': 'Reservar Servicio',
      'job.payNow': 'Pagar Ahora',
      'form.submit': 'Enviar',
      'form.cancel': 'Cancelar',
      'common.loading': 'Cargando...',
      'common.error': 'Error',
      'common.success': 'Éxito'
    },
    fr: {
      'app.title': 'Fix & Fresh',
      'nav.logout': 'Déconnexion',
      'nav.hello': 'Bonjour',
      'search.placeholder': 'Rechercher des services...',
      'dashboard.title': 'Tableau de Bord',
      'dashboard.createJob': 'Créer un Travail',
      'dashboard.myJobs': 'Mes Travaux',
      'dashboard.availableJobs': 'Travaux Disponibles',
      'dashboard.earnings': 'Gains',
      'dashboard.wallet': 'Portefeuille',
      'dashboard.transactions': 'Transactions',
      'dashboard.withdraw': 'Retirer',
      'dashboard.balance': 'Solde',
      'dashboard.totalEarnings': 'Gains Totaux',
      'dashboard.pendingPayments': 'Paiements en Attente',
      'dashboard.completedJobs': 'Travaux Terminés',
      'job.status.scheduled': 'Programmé',
      'job.status.enRoute': 'En Route',
      'job.status.inProgress': 'En Cours',
      'job.status.completed': 'Terminé',
      'job.status.cancelled': 'Annulé',
      'auth.login': 'Connexion',
      'auth.register': 'S\'inscrire',
      'auth.email': 'Email',
      'auth.password': 'Mot de Passe',
      'auth.name': 'Nom',
      'language.select': 'Sélectionner la Langue',
      'language.english': 'Anglais',
      'language.spanish': 'Espagnol',
      'language.french': 'Français',
      'language.portuguese': 'Portugais',
      'services.plumbing': 'Plomberie',
      'services.electrical': 'Électricité',
      'services.hvac': 'CVC',
      'services.carpentry': 'Menuiserie',
      'services.painting': 'Peinture',
      'services.cleaning': 'Nettoyage',
      'services.select': 'Sélectionner Service',
      'services.addOn': 'Complément',
      'services.market': 'Prix du Marché',
      'job.viewDetails': 'Voir les Détails',
      'job.accept': 'Accepter le Travail',
      'job.complete': 'Terminer le Travail',
      'job.cancel': 'Annuler le Travail',
      'job.location': 'Lieu',
      'job.description': 'Description',
      'job.price': 'Prix',
      'job.date': 'Date',
      'job.bookService': 'Réserver le Service',
      'job.payNow': 'Payer Maintenant',
      'form.submit': 'Soumettre',
      'form.cancel': 'Annuler',
      'common.loading': 'Chargement...',
      'common.error': 'Erreur',
      'common.success': 'Succès'
    },
    pt: {
      'app.title': 'Fix & Fresh',
      'nav.logout': 'Sair',
      'nav.hello': 'Olá',
      'search.placeholder': 'Pesquisar serviços...',
      'dashboard.title': 'Painel',
      'dashboard.createJob': 'Criar Trabalho',
      'dashboard.myJobs': 'Meus Trabalhos',
      'dashboard.availableJobs': 'Trabalhos Disponíveis',
      'dashboard.earnings': 'Ganhos',
      'dashboard.wallet': 'Carteira',
      'dashboard.transactions': 'Transações',
      'dashboard.withdraw': 'Sacar',
      'dashboard.balance': 'Saldo',
      'dashboard.totalEarnings': 'Ganhos Totais',
      'dashboard.pendingPayments': 'Pagamentos Pendentes',
      'dashboard.completedJobs': 'Trabalhos Concluídos',
      'job.status.scheduled': 'Agendado',
      'job.status.enRoute': 'A Caminho',
      'job.status.inProgress': 'Em Andamento',
      'job.status.completed': 'Concluído',
      'job.status.cancelled': 'Cancelado',
      'auth.login': 'Entrar',
      'auth.register': 'Registrar',
      'auth.email': 'Email',
      'auth.password': 'Senha',
      'auth.name': 'Nome',
      'language.select': 'Selecionar Idioma',
      'language.english': 'Inglês',
      'language.spanish': 'Espanhol',
      'language.french': 'Francês',
      'language.portuguese': 'Português',
      'services.plumbing': 'Encanamento',
      'services.electrical': 'Elétrica',
      'services.hvac': 'HVAC',
      'services.carpentry': 'Carpintaria',
      'services.painting': 'Pintura',
      'services.cleaning': 'Limpeza',
      'services.select': 'Selecionar Serviço',
      'services.addOn': 'Complemento',
      'services.market': 'Preço de Mercado',
      'job.viewDetails': 'Ver Detalhes',
      'job.accept': 'Aceitar Trabalho',
      'job.complete': 'Completar Trabalho',
      'job.cancel': 'Cancelar Trabalho',
      'job.location': 'Localização',
      'job.description': 'Descrição',
      'job.price': 'Preço',
      'job.date': 'Data',
      'job.bookService': 'Reservar Serviço',
      'job.payNow': 'Pagar Agora',
      'form.submit': 'Enviar',
      'form.cancel': 'Cancelar',
      'common.loading': 'Carregando...',
      'common.error': 'Erro',
      'common.success': 'Sucesso'
    }
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};