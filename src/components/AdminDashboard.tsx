import { useState, useEffect, useRef } from 'react';
import {
  X, Plus, Trash2, Edit2, Save, Upload, Phone, Globe, Mail, MapPin,
  Lock, Check, ToggleLeft, ToggleRight, AlertCircle, ImageIcon, Shield, User,
  Car as CarIcon, Calendar, MessageCircle, Bell, Clock
} from 'lucide-react';
import { supabase, Car, SiteSettings, AllowedIP, AdminCredentials, Rental } from '../lib/supabase';
import { useAdmin } from '../contexts/AdminContext';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

type Tab = 'cars' | 'cars-add' | 'site-settings' | 'credentials' | 'access' | 'rentals';

export default function AdminDashboard({ isOpen, onClose }: AdminDashboardProps) {
  const { isAdmin } = useAdmin();
  const [activeTab, setActiveTab] = useState<Tab>('cars');
  const [cars, setCars] = useState<Car[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Credentials state
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [credentialMessage, setCredentialMessage] = useState('');

  // Access control state
  const [allowedIPs, setAllowedIPs] = useState<AllowedIP[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminCredentials[]>([]);
  const [userIP, setUserIP] = useState('');
  const [newIPAddress, setNewIPAddress] = useState('');
  const [newIPLabel, setNewIPLabel] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [accessMessage, setAccessMessage] = useState('');

  // New car state
  const [carForm, setCarForm] = useState({
    name: '',
    brand: '',
    year: new Date().getFullYear(),
    price_per_day: 0,
    price_per_week: 0,
    price_per_month: 0,
    price_per_year: 0,
    image_url: '',
    images: [] as string[],
    transmission: 'Automatic',
    fuel_type: 'Petrol',
    seats: 5,
    features: '',
    available: true,
    images_3d_exterior: [] as string[],
    images_3d_interior: [] as string[],
  });

  // Settings state
  const [settingsForm, setSettingsForm] = useState({
    phone_primary: '',
    phone_secondary: '',
    logo_url: '',
    hero_bg_light: '',
    hero_bg_dark: '',
    whatsapp_number: '',
    facebook_url: '',
    instagram_url: '',
    twitter_url: '',
    tiktok_url: '',
    address: '',
    email: '',
  });

  // Edit car state
  const [editingCar, setEditingCar] = useState<Car | null>(null);

  // Upload state
  const [uploadingAdd, setUploadingAdd] = useState(false);
  const [uploadingEdit, setUploadingEdit] = useState(false);
  const [uploadingGalleryAdd, setUploadingGalleryAdd] = useState(false);
  const [uploadingGalleryEdit, setUploadingGalleryEdit] = useState(false);
  const addFileRef = useRef<HTMLInputElement>(null);
  const editFileRef = useRef<HTMLInputElement>(null);
  const addGalleryRef = useRef<HTMLInputElement>(null);
  const editGalleryRef = useRef<HTMLInputElement>(null);
  const logoUploadRef = useRef<HTMLInputElement>(null);
  const heroBgLightRef = useRef<HTMLInputElement>(null);
  const heroBgDarkRef = useRef<HTMLInputElement>(null);
  const [uploadingSettingsImg, setUploadingSettingsImg] = useState<string | null>(null);

  // 3D URL input state
  const [newExtUrlEdit, setNewExtUrlEdit] = useState('');
  const [newIntUrlEdit, setNewIntUrlEdit] = useState('');
  const [newExtUrlAdd, setNewExtUrlAdd] = useState('');
  const [newIntUrlAdd, setNewIntUrlAdd] = useState('');

  // Rentals state
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [rentalForm, setRentalForm] = useState({
    car_id: '',
    customer_name: '',
    customer_phone: '',
    customer_address: '',
    start_date: '',
    end_date: '',
    notes: '',
  });
  const [rentalMessage, setRentalMessage] = useState('');
  const [pendingReminders, setPendingReminders] = useState<(Rental & { car?: Car })[]>([]);
  const [confirmAction, setConfirmAction] = useState<{ type: 'complete' | 'delete'; rental: Rental } | null>(null);

  const uploadImage = async (file: File): Promise<string | null> => {
    const ext = file.name.split('.').pop();
    const filename = `car-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('car-images').upload(filename, file, { upsert: true });
    if (error) return null;
    const { data } = supabase.storage.from('car-images').getPublicUrl(filename);
    return data.publicUrl;
  };

  const handleAddImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAdd(true);
    const url = await uploadImage(file);
    if (url) setCarForm((prev) => ({ ...prev, image_url: url }));
    setUploadingAdd(false);
  };

  const handleEditImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingCar) return;
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingEdit(true);
    const url = await uploadImage(file);
    if (url) setEditingCar((prev) => prev ? { ...prev, image_url: url } : prev);
    setUploadingEdit(false);
  };

  // 3D URL handlers - Add form
  const add3DUrlAdd = (type: 'exterior' | 'interior', url: string) => {
    if (!url.trim()) return;
    const key = `images_3d_${type}` as 'images_3d_exterior' | 'images_3d_interior';
    setCarForm((prev) => ({ ...prev, [key]: [...(prev[key] as string[]), url.trim()] }));
    if (type === 'exterior') setNewExtUrlAdd('');
    else setNewIntUrlAdd('');
  };

  const remove3DImageAdd = (type: 'exterior' | 'interior', index: number) => {
    const key = `images_3d_${type}` as 'images_3d_exterior' | 'images_3d_interior';
    setCarForm((prev) => ({ ...prev, [key]: (prev[key] as string[]).filter((_, i) => i !== index) }));
  };

  // 3D URL handlers - Edit form
  const add3DUrlEdit = (type: 'exterior' | 'interior', url: string) => {
    if (!url.trim() || !editingCar) return;
    const key = `images_3d_${type}` as 'images_3d_exterior' | 'images_3d_interior';
    setEditingCar((prev) => prev ? { ...prev, [key]: [...(prev[key] || []), url.trim()] } : prev);
    if (type === 'exterior') setNewExtUrlEdit('');
    else setNewIntUrlEdit('');
  };

  const remove3DImageEdit = (type: 'exterior' | 'interior', index: number) => {
    if (!editingCar) return;
    const key = `images_3d_${type}` as 'images_3d_exterior' | 'images_3d_interior';
    setEditingCar((prev) => prev ? { ...prev, [key]: (prev[key] || []).filter((_: string, i: number) => i !== index) } : prev);
  };

  // Gallery upload - Add form
  const handleGalleryUploadAdd = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const remaining = 6 - carForm.images.length;
    const toUpload = files.slice(0, remaining);
    setUploadingGalleryAdd(true);
    const urls: string[] = [];
    for (const file of toUpload) {
      const url = await uploadImage(file);
      if (url) urls.push(url);
    }
    setCarForm((prev) => ({ ...prev, images: [...prev.images, ...urls] }));
    setUploadingGalleryAdd(false);
    e.target.value = '';
  };

  const removeGalleryImageAdd = (index: number) => {
    setCarForm((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  // Gallery upload - Edit form
  const handleGalleryUploadEdit = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingCar) return;
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const remaining = 6 - (editingCar.images || []).length;
    const toUpload = files.slice(0, remaining);
    setUploadingGalleryEdit(true);
    const urls: string[] = [];
    for (const file of toUpload) {
      const url = await uploadImage(file);
      if (url) urls.push(url);
    }
    setEditingCar((prev) => prev ? { ...prev, images: [...(prev.images || []), ...urls] } : prev);
    setUploadingGalleryEdit(false);
    e.target.value = '';
  };

  const removeGalleryImageEdit = (index: number) => {
    if (!editingCar) return;
    setEditingCar((prev) => prev ? { ...prev, images: (prev.images || []).filter((_: string, i: number) => i !== index) } : prev);
  };

  useEffect(() => {
    if (isOpen && isAdmin) {
      fetchCars();
      fetchSettings();
      fetchAllowedIPs();
      fetchAdminUsers();
      fetchUserIP();
      fetchRentals();
    }
  }, [isOpen, isAdmin]);

  const fetchAllowedIPs = async () => {
    const { data } = await supabase.from('allowed_ips').select('*').order('created_at', { ascending: true });
    if (data) setAllowedIPs(data);
  };

  const fetchAdminUsers = async () => {
    const { data } = await supabase.from('admin_credentials').select('id, email, username, created_at, updated_at, password_hash').order('created_at', { ascending: true });
    if (data) setAdminUsers(data);
  };

  const fetchUserIP = async () => {
    try {
      const res = await fetch('https://api.ipify.org?format=json');
      const { ip } = await res.json();
      setUserIP(ip);
    } catch {
      setUserIP('');
    }
  };

  const handleAddIP = async () => {
    if (!newIPAddress.trim()) return;
    setIsLoading(true);
    setAccessMessage('');
    const { error } = await supabase.from('allowed_ips').insert({ ip_address: newIPAddress.trim(), label: newIPLabel.trim() });
    if (!error) {
      setNewIPAddress('');
      setNewIPLabel('');
      fetchAllowedIPs();
      setAccessMessage('IP added successfully');
    } else {
      setAccessMessage('Error adding IP');
    }
    setIsLoading(false);
  };

  const handleDeleteIP = async (id: string) => {
    await supabase.from('allowed_ips').delete().eq('id', id);
    fetchAllowedIPs();
  };

  const handleAddCurrentIP = async () => {
    if (!userIP) return;
    setNewIPAddress(userIP);
  };

  const handleAddAdminUser = async () => {
    if (!newAdminEmail.trim() || !newAdminPassword.trim()) return;
    setIsLoading(true);
    setAccessMessage('');
    const { error } = await supabase.from('admin_credentials').insert({
      username: newAdminEmail.trim(),
      email: newAdminEmail.trim(),
      password_hash: newAdminPassword.trim(),
    });
    if (!error) {
      setNewAdminEmail('');
      setNewAdminPassword('');
      fetchAdminUsers();
      setAccessMessage('Admin user added successfully');
    } else {
      setAccessMessage('Error adding admin user');
    }
    setIsLoading(false);
  };

  const handleDeleteAdminUser = async (id: string) => {
    if (adminUsers.length <= 1) {
      setAccessMessage('Cannot delete the last admin account');
      return;
    }
    await supabase.from('admin_credentials').delete().eq('id', id);
    fetchAdminUsers();
  };

  const fetchCars = async () => {
    const { data } = await supabase
      .from('cars')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setCars(data);
  };

  const fetchSettings = async () => {
    const { data } = await supabase
      .from('site_settings')
      .select('*')
      .maybeSingle();
    if (data) {
      setSettings(data);
      setSettingsForm({
        phone_primary: data.phone_primary || '',
        phone_secondary: data.phone_secondary || '',
        whatsapp_number: data.whatsapp_number || '',
        facebook_url: data.facebook_url || '',
        instagram_url: data.instagram_url || '',
        twitter_url: data.twitter_url || '',
        tiktok_url: data.tiktok_url || '',
        logo_url: data.logo_url || '',
        hero_bg_light: data.hero_bg_light || '',
        hero_bg_dark: data.hero_bg_dark || '',
        address: data.address || '',
        email: data.email || '',
      });
    }
  };

  const fetchRentals = async () => {
    const { data } = await supabase
      .from('rentals')
      .select('*')
      .order('start_date', { ascending: false });
    if (data) {
      setRentals(data);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      const pending = data.filter(
        (r) => r.end_date === tomorrowStr && !r.reminder_sent && r.status === 'active'
      );
      if (pending.length > 0) {
        const withCars = await Promise.all(pending.map(async (r) => {
          const { data: car } = await supabase.from('cars').select('*').eq('id', r.car_id).maybeSingle();
          return { ...r, car: car || undefined };
        }));
        setPendingReminders(withCars);
      }
    }
  };

  const handleAddRental = async () => {
    if (!rentalForm.car_id || !rentalForm.customer_name || !rentalForm.customer_phone || !rentalForm.start_date || !rentalForm.end_date) {
      setRentalMessage('Please fill in all required fields.');
      return;
    }
    setIsLoading(true);
    const { error } = await supabase.from('rentals').insert({
      car_id: rentalForm.car_id,
      customer_name: rentalForm.customer_name,
      customer_phone: rentalForm.customer_phone,
      customer_address: rentalForm.customer_address || null,
      start_date: rentalForm.start_date,
      end_date: rentalForm.end_date,
      notes: rentalForm.notes || null,
      status: 'active',
    });
    if (!error) {
      await supabase.from('cars').update({ available: false }).eq('id', rentalForm.car_id);
      setRentalForm({ car_id: '', customer_name: '', customer_phone: '', customer_address: '', start_date: '', end_date: '', notes: '' });
      setRentalMessage('Rental recorded successfully.');
      fetchRentals();
      fetchCars();
    } else {
      setRentalMessage('Error saving rental.');
    }
    setIsLoading(false);
    setTimeout(() => setRentalMessage(''), 3000);
  };

  const handleCompleteRental = async (rental: Rental) => {
    await supabase.from('rentals').update({ status: 'completed' }).eq('id', rental.id);
    await supabase.from('cars').update({ available: true }).eq('id', rental.car_id);
    fetchRentals();
    fetchCars();
  };

  const handleDeleteRental = async (rental: Rental) => {
    await supabase.from('rentals').delete().eq('id', rental.id);
    const hasOtherActive = rentals.some((r) => r.car_id === rental.car_id && r.id !== rental.id && r.status === 'active');
    if (!hasOtherActive) {
      await supabase.from('cars').update({ available: true }).eq('id', rental.car_id);
    }
    fetchRentals();
    fetchCars();
  };

  const sendWhatsAppReminder = async (reminder: Rental & { car?: Car }, whatsappNumber: string) => {
    const phone = whatsappNumber.replace(/[^0-9]/g, '');
    const customerPhone = reminder.customer_phone.replace(/[^0-9]/g, '');
    const carName = reminder.car ? `${reminder.car.brand} ${reminder.car.name}` : 'vehicle';
    const message = encodeURIComponent(
      `🚗 *RENTAL RETURN REMINDER*\n\n` +
      `Dear ${reminder.customer_name},\n\n` +
      `This is a friendly reminder that your rental of *${carName}* is due for return tomorrow (${reminder.end_date}).\n\n` +
      `Please ensure you return the vehicle on time.\n\n` +
      `Thank you for choosing us! 🙏`
    );
    window.open(`https://wa.me/${customerPhone || phone}?text=${message}`, '_blank');
    await supabase.from('rentals').update({ reminder_sent: true }).eq('id', reminder.id);
    setPendingReminders((prev) => prev.filter((r) => r.id !== reminder.id));
  };

  if (!isOpen || !isAdmin) return null;

  const handleAddCar = async () => {
    setIsLoading(true);
    const features = carForm.features
      .split(',')
      .map((f) => f.trim())
      .filter((f) => f);

    const { error } = await supabase.from('cars').insert({
      name: carForm.name,
      brand: carForm.brand,
      year: carForm.year,
      price_per_day: carForm.price_per_day,
      price_per_week: carForm.price_per_week || null,
      price_per_month: carForm.price_per_month || null,
      price_per_year: carForm.price_per_year || null,
      image_url: carForm.image_url || null,
      transmission: carForm.transmission,
      fuel_type: carForm.fuel_type,
      seats: carForm.seats,
      features,
      available: carForm.available,
      images: carForm.images,
      images_3d_exterior: carForm.images_3d_exterior,
      images_3d_interior: carForm.images_3d_interior,
    });

    if (!error) {
      setCarForm({
        name: '',
        brand: '',
        year: new Date().getFullYear(),
        price_per_day: 0,
        price_per_week: 0,
        price_per_month: 0,
        price_per_year: 0,
        image_url: '',
        images: [],
        transmission: 'Automatic',
        fuel_type: 'Petrol',
        seats: 5,
        features: '',
        available: true,
        images_3d_exterior: [],
        images_3d_interior: [],
      });
      fetchCars();
      setActiveTab('cars');
    }
    setIsLoading(false);
  };

  const handleDeleteCar = async (id: string) => {
    if (!confirm('Are you sure you want to delete this car?')) return;
    await supabase.from('cars').delete().eq('id', id);
    fetchCars();
  };

  const handleUpdateCar = async () => {
    if (!editingCar) return;
    setIsLoading(true);

    const { error } = await supabase
      .from('cars')
      .update({
        name: editingCar.name,
        brand: editingCar.brand,
        year: editingCar.year,
        price_per_day: editingCar.price_per_day,
        price_per_week: editingCar.price_per_week,
        price_per_month: editingCar.price_per_month,
        price_per_year: editingCar.price_per_year,
        image_url: editingCar.image_url,
        transmission: editingCar.transmission,
        fuel_type: editingCar.fuel_type,
        seats: editingCar.seats,
        features: editingCar.features,
        available: editingCar.available,
        images: editingCar.images || [],
        images_3d_exterior: editingCar.images_3d_exterior || [],
        images_3d_interior: editingCar.images_3d_interior || [],
      })
      .eq('id', editingCar.id);

    if (!error) {
      setEditingCar(null);
      fetchCars();
    }
    setIsLoading(false);
  };

  const handleToggleAvailability = async (car: Car) => {
    await supabase
      .from('cars')
      .update({ available: !car.available })
      .eq('id', car.id);
    fetchCars();
  };

  const handleSettingsImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'logo_url' | 'hero_bg_light' | 'hero_bg_dark') => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingSettingsImg(field);
    const url = await uploadImage(file);
    if (url) setSettingsForm((prev) => ({ ...prev, [field]: url }));
    setUploadingSettingsImg(null);
    e.target.value = '';
  };

  const handleUpdateSettings = async () => {
    setIsLoading(true);
    if (settings) {
      await supabase
        .from('site_settings')
        .update(settingsForm)
        .eq('id', settings.id);
      fetchSettings();
    }
    setIsLoading(false);
  };

  const handleUpdateCredentials = async () => {
    if (!newEmail && !newPassword) return;
    setIsLoading(true);
    setCredentialMessage('');

    const updates: { email?: string; password_hash?: string } = {};
    if (newEmail) updates.email = newEmail;
    if (newPassword) updates.password_hash = newPassword;

    const { error } = await supabase
      .from('admin_credentials')
      .update(updates)
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (error) {
      setCredentialMessage('Error updating credentials');
    } else {
      setCredentialMessage('Credentials updated successfully');
      setNewEmail('');
      setNewPassword('');
    }
    setIsLoading(false);
  };

  const defaultCarImage = 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&auto=format&fit=crop&q=80';

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative ml-auto bg-white dark:bg-gray-900 w-full max-w-4xl h-full overflow-hidden shadow-2xl border-l border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="flex border-b border-gray-200 dark:border-gray-800">
          {[
            { id: 'cars', label: 'Manage Cars', icon: Edit2 },
            { id: 'cars-add', label: 'Add Car', icon: Plus },
            { id: 'rentals', label: 'Rentals', icon: CarIcon },
            { id: 'site-settings', label: 'Site Settings', icon: Phone },
            { id: 'credentials', label: 'Credentials', icon: Lock },
            { id: 'access', label: 'Access', icon: Shield },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 text-sm font-medium transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'text-primary-600 border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                  : 'text-gray-500 border-transparent hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="p-6 overflow-y-auto h-[calc(100%-140px)]">
          {/* Cars List Tab */}
          {activeTab === 'cars' && (
            <div className="space-y-4">
              {cars.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No cars found. Add your first car!</p>
                </div>
              ) : (
                cars.map((car) => (
                  <div
                    key={car.id}
                    className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl"
                  >
                    <img
                      src={car.image_url || defaultCarImage}
                      alt={car.name}
                      className="w-20 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                        {car.brand} {car.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        ${car.price_per_day}/day • {car.year}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleAvailability(car)}
                        className={`p-2 rounded-lg transition-colors ${
                          car.available
                            ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                        }`}
                        title={car.available ? 'Mark as unavailable' : 'Mark as available'}
                      >
                        {car.available ? (
                          <ToggleRight className="w-5 h-5" />
                        ) : (
                          <ToggleLeft className="w-5 h-5" />
                        )}
                      </button>
                      <button
                        onClick={() => setEditingCar(car)}
                        className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCar(car.id)}
                        className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))
              )}

              {/* Edit Car Modal */}
              {editingCar && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  <div className="absolute inset-0 bg-black/50" onClick={() => setEditingCar(null)} />
                  <div className="relative bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Edit Car</h3>
                    <div className="space-y-4">
                      <input
                        type="text"
                        value={editingCar.brand}
                        onChange={(e) => setEditingCar({ ...editingCar, brand: e.target.value })}
                        className="input-field"
                        placeholder="Brand"
                      />
                      <input
                        type="text"
                        value={editingCar.name}
                        onChange={(e) => setEditingCar({ ...editingCar, name: e.target.value })}
                        className="input-field"
                        placeholder="Model Name"
                      />
                      <input
                        type="number"
                        value={editingCar.year}
                        onChange={(e) => setEditingCar({ ...editingCar, year: parseInt(e.target.value) })}
                        className="input-field"
                        placeholder="Year"
                      />
                      <input
                        type="number"
                        value={editingCar.price_per_day}
                        onChange={(e) => setEditingCar({ ...editingCar, price_per_day: parseFloat(e.target.value) })}
                        className="input-field"
                        placeholder="Price per Day"
                        step="0.01"
                      />
                      <input
                        type="number"
                        value={editingCar.price_per_week || ''}
                        onChange={(e) => setEditingCar({ ...editingCar, price_per_week: parseFloat(e.target.value) || null })}
                        className="input-field"
                        placeholder="Price per Week (optional)"
                        step="0.01"
                      />
                      <input
                        type="number"
                        value={editingCar.price_per_month || ''}
                        onChange={(e) => setEditingCar({ ...editingCar, price_per_month: parseFloat(e.target.value) || null })}
                        className="input-field"
                        placeholder="Price per Month (optional)"
                        step="0.01"
                      />
                      <input
                        type="number"
                        value={editingCar.price_per_year || ''}
                        onChange={(e) => setEditingCar({ ...editingCar, price_per_year: parseFloat(e.target.value) || null })}
                        className="input-field"
                        placeholder="Price per Year (optional)"
                        step="0.01"
                      />
                      {/* Image Upload */}
                      <div>
                        <input ref={editFileRef} type="file" accept="image/*" className="hidden" onChange={handleEditImageUpload} />
                        <button
                          type="button"
                          onClick={() => editFileRef.current?.click()}
                          disabled={uploadingEdit}
                          className="w-full flex flex-col items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-primary-500 dark:hover:border-primary-400 transition-colors"
                        >
                          {editingCar.image_url ? (
                            <img src={editingCar.image_url} alt="Preview" className="w-full h-36 object-cover rounded-lg" />
                          ) : (
                            <>
                              <ImageIcon className="w-8 h-8 text-gray-400" />
                              <span className="text-sm text-gray-500 dark:text-gray-400">Click to upload image</span>
                            </>
                          )}
                          <span className="flex items-center gap-2 text-xs text-primary-600 dark:text-primary-400 font-medium mt-1">
                            <Upload className="w-4 h-4" />
                            {uploadingEdit ? 'Uploading...' : editingCar.image_url ? 'Change Image' : 'Upload Image'}
                          </span>
                        </button>
                      </div>
                      <select
                        value={editingCar.transmission}
                        onChange={(e) => setEditingCar({ ...editingCar, transmission: e.target.value })}
                        className="input-field"
                      >
                        <option value="Automatic">Automatic</option>
                        <option value="Manual">Manual</option>
                      </select>
                      <select
                        value={editingCar.fuel_type}
                        onChange={(e) => setEditingCar({ ...editingCar, fuel_type: e.target.value })}
                        className="input-field"
                      >
                        <option value="Petrol">Petrol</option>
                        <option value="Diesel">Diesel</option>
                        <option value="Electric">Electric</option>
                        <option value="Hybrid">Hybrid</option>
                      </select>
                      <input
                        type="number"
                        value={editingCar.seats}
                        onChange={(e) => setEditingCar({ ...editingCar, seats: parseInt(e.target.value) })}
                        className="input-field"
                        placeholder="Seats"
                      />
                      <textarea
                        value={editingCar.features.join(', ')}
                        onChange={(e) => setEditingCar({ ...editingCar, features: e.target.value.split(',').map((f) => f.trim()) })}
                        className="input-field"
                        placeholder="Features (comma-separated)"
                        rows={3}
                      />
                      {/* Gallery Images (up to 6) */}
                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Gallery Images ({(editingCar.images || []).length}/6)
                        </p>
                        <input ref={editGalleryRef} type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryUploadEdit} />
                        {(editingCar.images || []).length < 6 && (
                          <button type="button" onClick={() => editGalleryRef.current?.click()} disabled={uploadingGalleryEdit} className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-primary-500 transition-colors text-sm text-gray-600 dark:text-gray-400 font-medium">
                            <Upload className="w-4 h-4" />
                            {uploadingGalleryEdit ? 'Uploading...' : `Upload Photos (${6 - (editingCar.images || []).length} remaining)`}
                          </button>
                        )}
                        {(editingCar.images || []).length > 0 && (
                          <div className="grid grid-cols-3 gap-2">
                            {(editingCar.images || []).map((url: string, i: number) => (
                              <div key={i} className="relative group">
                                <img src={url} className="w-full h-20 object-cover rounded-lg" />
                                <button onClick={() => removeGalleryImageEdit(i)} className="absolute top-1 right-1 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                  <X className="w-3 h-3 text-white" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* 3D Exterior — Link */}
                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Exterior 3D — Image Links</p>
                        <div className="flex gap-2">
                          <input
                            type="url"
                            value={newExtUrlEdit}
                            onChange={(e) => setNewExtUrlEdit(e.target.value)}
                            className="input-field flex-1 text-sm"
                            placeholder="Paste image URL..."
                          />
                          <button type="button" onClick={() => add3DUrlEdit('exterior', newExtUrlEdit)} disabled={!newExtUrlEdit.trim()} className="px-3 py-2 bg-blue-600 text-white rounded-xl text-sm hover:bg-blue-700 transition-colors disabled:opacity-40">
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        {(editingCar.images_3d_exterior || []).length > 0 && (
                          <div className="grid grid-cols-3 gap-2">
                            {(editingCar.images_3d_exterior || []).map((url: string, i: number) => (
                              <div key={i} className="relative group">
                                <img src={url} className="w-full h-16 object-cover rounded-lg" onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=200'; }} />
                                <button onClick={() => remove3DImageEdit('exterior', i)} className="absolute top-0.5 right-0.5 p-0.5 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                  <X className="w-3 h-3 text-white" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* 3D Interior — Link */}
                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Interior 3D — Image Links</p>
                        <div className="flex gap-2">
                          <input
                            type="url"
                            value={newIntUrlEdit}
                            onChange={(e) => setNewIntUrlEdit(e.target.value)}
                            className="input-field flex-1 text-sm"
                            placeholder="Paste image URL..."
                          />
                          <button type="button" onClick={() => add3DUrlEdit('interior', newIntUrlEdit)} disabled={!newIntUrlEdit.trim()} className="px-3 py-2 bg-emerald-600 text-white rounded-xl text-sm hover:bg-emerald-700 transition-colors disabled:opacity-40">
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        {(editingCar.images_3d_interior || []).length > 0 && (
                          <div className="grid grid-cols-3 gap-2">
                            {(editingCar.images_3d_interior || []).map((url: string, i: number) => (
                              <div key={i} className="relative group">
                                <img src={url} className="w-full h-16 object-cover rounded-lg" onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=200'; }} />
                                <button onClick={() => remove3DImageEdit('interior', i)} className="absolute top-0.5 right-0.5 p-0.5 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                  <X className="w-3 h-3 text-white" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Available
                        </label>
                        <button
                          onClick={() => setEditingCar({ ...editingCar, available: !editingCar.available })}
                          className={`p-2 rounded-lg transition-colors ${
                            editingCar.available
                              ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                          }`}
                        >
                          {editingCar.available ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                    <div className="flex gap-3 mt-6">
                      <button onClick={() => setEditingCar(null)} className="btn-secondary flex-1">
                        Cancel
                      </button>
                      <button onClick={handleUpdateCar} disabled={isLoading} className="btn-primary flex-1 gap-2">
                        <Save className="w-5 h-5" />
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Add Car Tab */}
          {activeTab === 'cars-add' && (
            <div className="max-w-md mx-auto space-y-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Add New Car</h3>
              <input
                type="text"
                value={carForm.brand}
                onChange={(e) => setCarForm({ ...carForm, brand: e.target.value })}
                className="input-field"
                placeholder="Brand (e.g., Toyota)"
              />
              <input
                type="text"
                value={carForm.name}
                onChange={(e) => setCarForm({ ...carForm, name: e.target.value })}
                className="input-field"
                placeholder="Model Name (e.g., Camry)"
              />
              <input
                type="number"
                value={carForm.year}
                onChange={(e) => setCarForm({ ...carForm, year: parseInt(e.target.value) })}
                className="input-field"
                placeholder="Year"
              />
              <input
                type="number"
                value={carForm.price_per_day}
                onChange={(e) => setCarForm({ ...carForm, price_per_day: parseFloat(e.target.value) })}
                className="input-field"
                placeholder="Price per Day ($)"
                step="0.01"
              />
              <input
                type="number"
                value={carForm.price_per_week}
                onChange={(e) => setCarForm({ ...carForm, price_per_week: parseFloat(e.target.value) })}
                className="input-field"
                placeholder="Price per Week ($) - optional"
                step="0.01"
              />
              <input
                type="number"
                value={carForm.price_per_month}
                onChange={(e) => setCarForm({ ...carForm, price_per_month: parseFloat(e.target.value) })}
                className="input-field"
                placeholder="Price per Month ($) - optional"
                step="0.01"
              />
              <input
                type="number"
                value={carForm.price_per_year}
                onChange={(e) => setCarForm({ ...carForm, price_per_year: parseFloat(e.target.value) })}
                className="input-field"
                placeholder="Price per Year ($) - optional"
                step="0.01"
              />
              {/* Image Upload */}
              <div>
                <input ref={addFileRef} type="file" accept="image/*" className="hidden" onChange={handleAddImageUpload} />
                <button
                  type="button"
                  onClick={() => addFileRef.current?.click()}
                  disabled={uploadingAdd}
                  className="w-full flex flex-col items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-primary-500 dark:hover:border-primary-400 transition-colors"
                >
                  {carForm.image_url ? (
                    <img src={carForm.image_url} alt="Preview" className="w-full h-36 object-cover rounded-lg" />
                  ) : (
                    <>
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                      <span className="text-sm text-gray-500 dark:text-gray-400">Click to upload image</span>
                    </>
                  )}
                  <span className="flex items-center gap-2 text-xs text-primary-600 dark:text-primary-400 font-medium mt-1">
                    <Upload className="w-4 h-4" />
                    {uploadingAdd ? 'Uploading...' : carForm.image_url ? 'Change Image' : 'Upload Image'}
                  </span>
                </button>
              </div>
              <select
                value={carForm.transmission}
                onChange={(e) => setCarForm({ ...carForm, transmission: e.target.value })}
                className="input-field"
              >
                <option value="Automatic">Automatic</option>
                <option value="Manual">Manual</option>
              </select>
              <select
                value={carForm.fuel_type}
                onChange={(e) => setCarForm({ ...carForm, fuel_type: e.target.value })}
                className="input-field"
              >
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="Electric">Electric</option>
                <option value="Hybrid">Hybrid</option>
              </select>
              <input
                type="number"
                value={carForm.seats}
                onChange={(e) => setCarForm({ ...carForm, seats: parseInt(e.target.value) })}
                className="input-field"
                placeholder="Number of Seats"
              />
              <textarea
                value={carForm.features}
                onChange={(e) => setCarForm({ ...carForm, features: e.target.value })}
                className="input-field"
                placeholder="Features (comma-separated: GPS, Bluetooth, Sunroof...)"
                rows={3}
              />
              {/* Gallery Images (up to 6) */}
              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Gallery Images ({carForm.images.length}/6)
                </p>
                <input ref={addGalleryRef} type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryUploadAdd} />
                {carForm.images.length < 6 && (
                  <button type="button" onClick={() => addGalleryRef.current?.click()} disabled={uploadingGalleryAdd} className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-primary-500 transition-colors text-sm text-gray-600 dark:text-gray-400 font-medium">
                    <Upload className="w-4 h-4" />
                    {uploadingGalleryAdd ? 'Uploading...' : `Upload Photos (${6 - carForm.images.length} remaining)`}
                  </button>
                )}
                {carForm.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {carForm.images.map((url, i) => (
                      <div key={i} className="relative group">
                        <img src={url} className="w-full h-20 object-cover rounded-lg" />
                        <button onClick={() => removeGalleryImageAdd(i)} className="absolute top-1 right-1 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                          <X className="w-3 h-3 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 3D Exterior — Link */}
              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Exterior 3D — Image Links</p>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={newExtUrlAdd}
                    onChange={(e) => setNewExtUrlAdd(e.target.value)}
                    className="input-field flex-1 text-sm"
                    placeholder="Paste image URL..."
                  />
                  <button type="button" onClick={() => add3DUrlAdd('exterior', newExtUrlAdd)} disabled={!newExtUrlAdd.trim()} className="px-3 py-2 bg-blue-600 text-white rounded-xl text-sm hover:bg-blue-700 transition-colors disabled:opacity-40">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {carForm.images_3d_exterior.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {carForm.images_3d_exterior.map((url, i) => (
                      <div key={i} className="relative group">
                        <img src={url} className="w-full h-16 object-cover rounded-lg" onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=200'; }} />
                        <button onClick={() => remove3DImageAdd('exterior', i)} className="absolute top-0.5 right-0.5 p-0.5 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                          <X className="w-3 h-3 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 3D Interior — Link */}
              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Interior 3D — Image Links</p>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={newIntUrlAdd}
                    onChange={(e) => setNewIntUrlAdd(e.target.value)}
                    className="input-field flex-1 text-sm"
                    placeholder="Paste image URL..."
                  />
                  <button type="button" onClick={() => add3DUrlAdd('interior', newIntUrlAdd)} disabled={!newIntUrlAdd.trim()} className="px-3 py-2 bg-emerald-600 text-white rounded-xl text-sm hover:bg-emerald-700 transition-colors disabled:opacity-40">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {carForm.images_3d_interior.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {carForm.images_3d_interior.map((url, i) => (
                      <div key={i} className="relative group">
                        <img src={url} className="w-full h-16 object-cover rounded-lg" onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=200'; }} />
                        <button onClick={() => remove3DImageAdd('interior', i)} className="absolute top-0.5 right-0.5 p-0.5 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                          <X className="w-3 h-3 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Available for Rent
                </label>
                <button
                  onClick={() => setCarForm({ ...carForm, available: !carForm.available })}
                  className={`p-2 rounded-lg transition-colors ${
                    carForm.available
                      ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                  }`}
                >
                  {carForm.available ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                </button>
              </div>
              <button onClick={handleAddCar} disabled={isLoading} className="btn-accent w-full gap-2">
                <Plus className="w-5 h-5" />
                Add Car
              </button>
            </div>
          )}

          {/* Site Settings Tab */}
          {activeTab === 'site-settings' && (
            <div className="max-w-md mx-auto space-y-4">
              {/* Logo Upload */}
              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Site Logo</p>
                <div className="flex items-center gap-3">
                  <img
                    src={settingsForm.logo_url || '/WhatsApp_Image_2026-06-27_at_12.02.59_AM.jpeg'}
                    alt="Logo preview"
                    className="w-16 h-16 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                  />
                  <div className="flex-1">
                    <input ref={logoUploadRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleSettingsImageUpload(e, 'logo_url')} />
                    <button type="button" onClick={() => logoUploadRef.current?.click()} disabled={uploadingSettingsImg === 'logo_url'} className="w-full flex items-center justify-center gap-2 p-2.5 border-2 border-dashed border-primary-300 dark:border-primary-700 rounded-xl hover:border-primary-500 transition-colors text-sm text-primary-600 dark:text-primary-400 font-medium">
                      <Upload className="w-4 h-4" />
                      {uploadingSettingsImg === 'logo_url' ? 'Uploading...' : 'Change Logo'}
                    </button>
                    {settingsForm.logo_url && (
                      <button type="button" onClick={() => setSettingsForm((prev) => ({ ...prev, logo_url: '' }))} className="w-full mt-1.5 text-xs text-red-500 hover:text-red-600 transition-colors">
                        Remove custom logo
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Hero Background - Light */}
              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Hero Background — Light Mode</p>
                <input ref={heroBgLightRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleSettingsImageUpload(e, 'hero_bg_light')} />
                {settingsForm.hero_bg_light ? (
                  <div className="relative group">
                    <img src={settingsForm.hero_bg_light} className="w-full h-24 object-cover rounded-xl" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-2">
                      <button type="button" onClick={() => heroBgLightRef.current?.click()} className="px-3 py-1.5 bg-white text-gray-800 text-xs font-medium rounded-lg">Change</button>
                      <button type="button" onClick={() => setSettingsForm((prev) => ({ ...prev, hero_bg_light: '' }))} className="px-3 py-1.5 bg-red-500 text-white text-xs font-medium rounded-lg">Remove</button>
                    </div>
                  </div>
                ) : (
                  <button type="button" onClick={() => heroBgLightRef.current?.click()} disabled={uploadingSettingsImg === 'hero_bg_light'} className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-primary-500 transition-colors text-sm text-gray-600 dark:text-gray-400 font-medium">
                    <Upload className="w-4 h-4" />
                    {uploadingSettingsImg === 'hero_bg_light' ? 'Uploading...' : 'Upload Light Background'}
                  </button>
                )}
              </div>

              {/* Hero Background - Dark */}
              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Hero Background — Dark Mode</p>
                <input ref={heroBgDarkRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleSettingsImageUpload(e, 'hero_bg_dark')} />
                {settingsForm.hero_bg_dark ? (
                  <div className="relative group">
                    <img src={settingsForm.hero_bg_dark} className="w-full h-24 object-cover rounded-xl" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-2">
                      <button type="button" onClick={() => heroBgDarkRef.current?.click()} className="px-3 py-1.5 bg-white text-gray-800 text-xs font-medium rounded-lg">Change</button>
                      <button type="button" onClick={() => setSettingsForm((prev) => ({ ...prev, hero_bg_dark: '' }))} className="px-3 py-1.5 bg-red-500 text-white text-xs font-medium rounded-lg">Remove</button>
                    </div>
                  </div>
                ) : (
                  <button type="button" onClick={() => heroBgDarkRef.current?.click()} disabled={uploadingSettingsImg === 'hero_bg_dark'} className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-600 dark:border-gray-500 rounded-xl hover:border-primary-500 transition-colors text-sm text-gray-600 dark:text-gray-400 font-medium">
                    <Upload className="w-4 h-4" />
                    {uploadingSettingsImg === 'hero_bg_dark' ? 'Uploading...' : 'Upload Dark Background'}
                  </button>
                )}
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Contact & Phone Numbers</h3>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={settingsForm.address}
                  onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                  className="input-field pl-12"
                  placeholder="Address (e.g. ERBIL, WAVE AVENUE)"
                />
              </div>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={settingsForm.email}
                  onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                  className="input-field pl-12"
                  placeholder="Email Address"
                />
              </div>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  value={settingsForm.phone_primary}
                  onChange={(e) => setSettingsForm({ ...settingsForm, phone_primary: e.target.value })}
                  className="input-field pl-12"
                  placeholder="Primary Phone Number"
                />
              </div>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  value={settingsForm.phone_secondary}
                  onChange={(e) => setSettingsForm({ ...settingsForm, phone_secondary: e.target.value })}
                  className="input-field pl-12"
                  placeholder="Secondary Phone Number (optional)"
                />
              </div>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  value={settingsForm.whatsapp_number}
                  onChange={(e) => setSettingsForm({ ...settingsForm, whatsapp_number: e.target.value })}
                  className="input-field pl-12"
                  placeholder="WhatsApp Number"
                />
              </div>

              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 mt-8">Social Media</h3>
              <div className="relative">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="url"
                  value={settingsForm.facebook_url}
                  onChange={(e) => setSettingsForm({ ...settingsForm, facebook_url: e.target.value })}
                  className="input-field pl-12"
                  placeholder="Facebook URL"
                />
              </div>
              <div className="relative">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="url"
                  value={settingsForm.instagram_url}
                  onChange={(e) => setSettingsForm({ ...settingsForm, instagram_url: e.target.value })}
                  className="input-field pl-12"
                  placeholder="Instagram URL"
                />
              </div>
              <div className="relative">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="url"
                  value={settingsForm.tiktok_url}
                  onChange={(e) => setSettingsForm({ ...settingsForm, tiktok_url: e.target.value })}
                  className="input-field pl-12"
                  placeholder="TikTok Profile URL"
                />
              </div>

              <button onClick={handleUpdateSettings} disabled={isLoading} className="btn-primary w-full gap-2">
                <Save className="w-5 h-5" />
                Save Settings
              </button>
            </div>
          )}

          {/* Credentials Tab */}
          {activeTab === 'credentials' && (
            <div className="max-w-md mx-auto space-y-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Change Admin Credentials</h3>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="input-field pl-12"
                  placeholder="New Email"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input-field pl-12"
                  placeholder="New Password"
                />
              </div>

              {credentialMessage && (
                <div className={`p-4 rounded-xl flex items-center gap-3 ${
                  credentialMessage.includes('success')
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                    : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                }`}>
                  {credentialMessage.includes('success') ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <AlertCircle className="w-5 h-5" />
                  )}
                  {credentialMessage}
                </div>
              )}

              <button onClick={handleUpdateCredentials} disabled={isLoading} className="btn-primary w-full gap-2">
                <Save className="w-5 h-5" />
                Update Credentials
              </button>
            </div>
          )}

          {/* Access Control Tab */}
          {activeTab === 'access' && (
            <div className="max-w-lg mx-auto space-y-8">

              {/* Current IP info */}
              {userIP && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                  <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">Your current IP address</p>
                  <p className="text-lg font-mono font-bold text-blue-900 dark:text-blue-100 mt-1">{userIP}</p>
                </div>
              )}

              {accessMessage && (
                <div className={`p-3 rounded-xl flex items-center gap-3 text-sm ${
                  accessMessage.includes('success')
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                    : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                }`}>
                  {accessMessage.includes('success') ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  {accessMessage}
                </div>
              )}

              {/* IP Whitelist Section */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary-500" />
                  IP Whitelist
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                  Only these IPs can see the admin button. Leave empty to allow everyone (setup mode).
                </p>

                {allowedIPs.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {allowedIPs.map((ip) => (
                      <div key={ip.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                        <div>
                          <p className="font-mono text-sm font-semibold text-gray-900 dark:text-white">{ip.ip_address}</p>
                          {ip.label && <p className="text-xs text-gray-500 dark:text-gray-400">{ip.label}</p>}
                        </div>
                        <button
                          onClick={() => handleDeleteIP(ip.id)}
                          className="p-1.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newIPAddress}
                      onChange={(e) => setNewIPAddress(e.target.value)}
                      className="input-field flex-1 font-mono"
                      placeholder="IP Address (e.g. 192.168.1.1)"
                    />
                    {userIP && (
                      <button
                        onClick={handleAddCurrentIP}
                        title="Use my current IP"
                        className="px-3 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-xl text-xs font-medium hover:bg-blue-200 transition-colors whitespace-nowrap"
                      >
                        My IP
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={newIPLabel}
                    onChange={(e) => setNewIPLabel(e.target.value)}
                    className="input-field"
                    placeholder="Label (e.g. Home, Office) — optional"
                  />
                  <button onClick={handleAddIP} disabled={isLoading || !newIPAddress.trim()} className="btn-primary w-full gap-2">
                    <Plus className="w-4 h-4" />
                    Add IP
                  </button>
                </div>
              </div>

              {/* Admin Users Section */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                  <User className="w-5 h-5 text-accent-500" />
                  Admin Users
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                  All users who can log in to the admin dashboard.
                </p>

                {adminUsers.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {adminUsers.map((admin) => (
                      <div key={admin.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{admin.email || admin.username}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Admin</p>
                        </div>
                        <button
                          onClick={() => handleDeleteAdminUser(admin.id)}
                          disabled={adminUsers.length <= 1}
                          className="p-1.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-2">
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={newAdminEmail}
                      onChange={(e) => setNewAdminEmail(e.target.value)}
                      className="input-field pl-12"
                      placeholder="New Admin Email"
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      value={newAdminPassword}
                      onChange={(e) => setNewAdminPassword(e.target.value)}
                      className="input-field pl-12"
                      placeholder="New Admin Password"
                    />
                  </div>
                  <button
                    onClick={handleAddAdminUser}
                    disabled={isLoading || !newAdminEmail.trim() || !newAdminPassword.trim()}
                    className="btn-accent w-full gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Admin
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* Rentals Tab */}
          {activeTab === 'rentals' && (
            <div className="space-y-6">

              {/* Pending reminder alerts */}
              {pendingReminders.length > 0 && (
                <div className="space-y-2">
                  {pendingReminders.map((r) => (
                    <div key={r.id} className="flex items-center justify-between p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700">
                      <div className="flex items-center gap-3">
                        <Bell className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                            Reminder due tomorrow — {r.customer_name}
                          </p>
                          <p className="text-xs text-amber-600 dark:text-amber-400">
                            {r.car ? `${r.car.brand} ${r.car.name}` : 'Car'} • Return: {r.end_date} • {r.customer_phone}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => sendWhatsAppReminder(r, settings?.whatsapp_number || '')}
                        className="flex items-center gap-1.5 px-3 py-2 bg-amber-600 text-white text-xs font-semibold rounded-xl hover:bg-amber-700 transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Send WhatsApp
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Rental Form */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-5 space-y-4 border border-gray-200 dark:border-gray-700">
                <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Plus className="w-4 h-4 text-primary-500" />
                  Record New Rental
                </h3>

                {/* Car select */}
                <div className="relative">
                  <select
                    value={rentalForm.car_id}
                    onChange={(e) => setRentalForm((p) => ({ ...p, car_id: e.target.value }))}
                    className="input-field appearance-none"
                  >
                    <option value="">Select Car *</option>
                    {cars.map((c) => (
                      <option key={c.id} value={c.id}>{c.brand} {c.name} ({c.year})</option>
                    ))}
                  </select>
                </div>

                {/* Customer info */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={rentalForm.customer_name}
                      onChange={(e) => setRentalForm((p) => ({ ...p, customer_name: e.target.value }))}
                      className="input-field pl-10"
                      placeholder="Customer Name *"
                    />
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      value={rentalForm.customer_phone}
                      onChange={(e) => setRentalForm((p) => ({ ...p, customer_phone: e.target.value }))}
                      className="input-field pl-10"
                      placeholder="Phone Number *"
                    />
                  </div>
                </div>

                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={rentalForm.customer_address}
                    onChange={(e) => setRentalForm((p) => ({ ...p, customer_address: e.target.value }))}
                    className="input-field pl-10"
                    placeholder="Customer Address"
                  />
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Pickup Date *</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="date"
                        value={rentalForm.start_date}
                        onChange={(e) => setRentalForm((p) => ({ ...p, start_date: e.target.value }))}
                        className="input-field pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Return Date *</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="date"
                        value={rentalForm.end_date}
                        min={rentalForm.start_date}
                        onChange={(e) => setRentalForm((p) => ({ ...p, end_date: e.target.value }))}
                        className="input-field pl-10"
                      />
                    </div>
                  </div>
                </div>

                <textarea
                  value={rentalForm.notes}
                  onChange={(e) => setRentalForm((p) => ({ ...p, notes: e.target.value }))}
                  className="input-field resize-none"
                  rows={2}
                  placeholder="Notes (optional)"
                />

                {rentalMessage && (
                  <p className={`text-sm font-medium ${rentalMessage.includes('Error') ? 'text-red-500' : 'text-green-600'}`}>
                    {rentalMessage}
                  </p>
                )}

                <button
                  onClick={handleAddRental}
                  disabled={isLoading}
                  className="btn-primary w-full gap-2"
                >
                  <Save className="w-4 h-4" />
                  {isLoading ? 'Saving...' : 'Record Rental'}
                </button>
              </div>

              {/* Active Rentals List */}
              <div className="space-y-3">
                <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary-500" />
                  All Rentals
                </h3>

                {rentals.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <CarIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No rentals recorded yet.</p>
                  </div>
                ) : (
                  rentals.map((rental) => {
                    const car = cars.find((c) => c.id === rental.car_id);
                    const today = new Date().toISOString().split('T')[0];
                    const isActive = rental.status === 'active' && rental.end_date >= today;
                    const isDue = rental.status === 'active' && rental.end_date < today;
                    return (
                      <div key={rental.id} className={`p-4 rounded-xl border space-y-3 ${
                        isDue ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/10' :
                        isActive ? 'border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-900/10' :
                        'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50'
                      }`}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                                isDue ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                                isActive ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300' :
                                'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                              }`}>
                                {isDue ? 'OVERDUE' : rental.status.toUpperCase()}
                              </span>
                              <p className="text-sm font-bold text-gray-900 dark:text-white">
                                {car ? `${car.brand} ${car.name}` : 'Unknown Car'}
                              </p>
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">{rental.customer_name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                              <Phone className="w-3.5 h-3.5" /> {rental.customer_phone}
                            </p>
                            {rental.customer_address && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5" /> {rental.customer_address}
                              </p>
                            )}
                            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {rental.start_date} → {rental.end_date}
                            </p>
                            {rental.notes && (
                              <p className="text-xs text-gray-400 italic">{rental.notes}</p>
                            )}
                          </div>

                          <div className="flex flex-col gap-1.5 shrink-0">
                            {rental.status === 'active' && (
                              <>
                                <button
                                  onClick={() => {
                                    const p = rental.customer_phone.replace(/[^0-9]/g, '');
                                    const carName = car ? `${car.brand} ${car.name}` : 'vehicle';
                                    const msg = encodeURIComponent(
                                      `🚗 *RENTAL RETURN REMINDER*\n\nDear ${rental.customer_name},\n\nThis is a reminder that your rental of *${carName}* is due for return on ${rental.end_date}.\n\nPlease ensure you return the vehicle on time.\n\nThank you! 🙏`
                                    );
                                    window.open(`https://wa.me/${p}?text=${msg}`, '_blank');
                                  }}
                                  className="flex items-center gap-1 px-2.5 py-1.5 bg-accent-600 text-white text-xs rounded-lg hover:bg-accent-700 transition-colors"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                  Remind
                                </button>
                                <button
                                  onClick={() => setConfirmAction({ type: 'complete', rental })}
                                  className="flex items-center gap-1 px-2.5 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  Complete
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => setConfirmAction({ type: 'delete', rental })}
                              className="flex items-center gap-1 px-2.5 py-1.5 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Confirmation dialog */}
      {confirmAction && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setConfirmAction(null)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Are you sure?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              {confirmAction.type === 'delete'
                ? `This will permanently delete the rental for "${confirmAction.rental.customer_name}" and restore car availability.`
                : `Mark the rental for "${confirmAction.rental.customer_name}" as completed and restore car availability.`}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmAction(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                No, Cancel
              </button>
              <button
                onClick={() => {
                  if (confirmAction.type === 'complete') handleCompleteRental(confirmAction.rental);
                  else handleDeleteRental(confirmAction.rental);
                  setConfirmAction(null);
                }}
                className={`flex-1 py-2.5 rounded-xl text-white font-semibold text-sm transition-colors ${
                  confirmAction.type === 'delete'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                Yes, {confirmAction.type === 'delete' ? 'Delete' : 'Complete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
