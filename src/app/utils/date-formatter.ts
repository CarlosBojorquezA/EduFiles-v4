export class DateFormatter {
  /**
   * Formatea fecha estilo WhatsApp
   * Hoy, Ayer, Día de la semana, o fecha completa
   */
  static formatWhatsAppStyle(dateString: string): string {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    
    // Resetear horas para comparación de días
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const nowOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const daysDiff = Math.floor((nowOnly.getTime() - dateOnly.getTime()) / (1000 * 60 * 60 * 24));
    
    // Hoy
    if (daysDiff === 0) {
      return 'Hoy';
    }
    
    // Ayer
    if (daysDiff === 1) {
      return 'Ayer';
    }
    
    // Esta semana (últimos 6 días)
    if (daysDiff < 7) {
      const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
      return days[date.getDay()];
    }
    
    // Fecha exacta
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  }

  /**
   * Formatea solo la hora (HH:MM)
   */
  static formatTime(dateString: string): string {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${hours}:${minutes}`;
  }

  /**
   * Verifica si una fecha es de hoy
   */
  static isToday(dateString: string): boolean {
    if (!dateString) return false;
    
    const date = new Date(dateString);
    const now = new Date();
    
    return date.getDate() === now.getDate() &&
           date.getMonth() === now.getMonth() &&
           date.getFullYear() === now.getFullYear();
  }

  /**
   * Formatea fecha para encabezado de chat (Hoy, Ayer, o fecha)
   */
  static formatChatDate(dateString: string): string {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const nowOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const daysDiff = Math.floor((nowOnly.getTime() - dateOnly.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 0) return 'Hoy';
    if (daysDiff === 1) return 'Ayer';
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  }
}