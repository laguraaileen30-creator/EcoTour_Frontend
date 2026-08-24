import { useEcoTour } from '../../../context/EcoTourContext';

export default function useBookings() {
  const { currentUser, reservations, resortBookings } = useEcoTour();
  const allList = reservations || resortBookings || [];

  const clientEmail = (currentUser?.email || '').toLowerCase().trim();
  const clientName = (`${currentUser?.fname || ''} ${currentUser?.lname || ''}`.trim() || currentUser?.name || '').toLowerCase().trim();
  const clientUserNum = String(currentUser?.user_number || currentUser?.userNumber || currentUser?.assignedId || '').toLowerCase().trim();
  const clientUserId = String(currentUser?.id || currentUser?.user_id || '').toLowerCase().trim();

  const userBookings = allList.filter((r) => {
    if (!currentUser) return true;
    const rEmail = (r.email || r.clientEmail || r.touristEmail || '').toLowerCase().trim();
    const rName = (r.clientName || r.fullName || r.touristName || '').toLowerCase().trim();
    const rUserNum = (r.userNumber || r.client_id || r.client_number || '').toLowerCase().trim();
    const rUserId = String(r.userId || r.user_id || '').toLowerCase().trim();

    const matchesEmail = Boolean(clientEmail && rEmail && (rEmail === clientEmail || rEmail.includes(clientEmail) || clientEmail.includes(rEmail)));
    const matchesName = Boolean(clientName && rName && (rName.includes(clientName) || clientName.includes(rName)));
    const matchesUserNum = Boolean(clientUserNum && rUserNum && (rUserNum === clientUserNum || rUserNum.includes(clientUserNum)));
    const matchesId = Boolean(clientUserId && rUserId && clientUserId === rUserId);

    return matchesEmail || matchesName || matchesUserNum || matchesId || !clientEmail || clientEmail.includes('client');
  });

  return { bookings: userBookings, loading: false, error: null };
}