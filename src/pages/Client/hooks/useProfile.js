import { useState, useEffect } from 'react';
import { getProfile } from '../services/profileService';

export default function useProfile() {
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('user');
    if (saved) {
      try {
        const u = JSON.parse(saved);
        return {
          firstName: u.fname || u.firstName || '',
          middleName: u.mname || u.middleName || '',
          lastName: u.lname || u.lastName || '',
          email: u.email || '',
          phone: u.contact_no || u.phone || '',
          address: u.address || '',
          gender: u.gender || '',
          birthday: u.birthdate || u.birthday || '',
        };
      } catch (e) {}
    }
    return {
      firstName: '',
      middleName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      gender: '',
      birthday: '',
    };
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Uncomment when backend is ready:
    // const fetchProfile = async () => {
    //   try {
    //     setLoading(true);
    //     const response = await getProfile();
    //     setProfile(response.data);
    //   } catch (err) {
    //     console.error(err);
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    // fetchProfile();
  }, []);

  return { profile, loading };
}