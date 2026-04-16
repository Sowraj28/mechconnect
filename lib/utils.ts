import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const MONTHLY_PRICE = 99;
export const ANNUAL_PRICE = 999;

export function calculatePayment(vehicleCount: number, planType: 'MONTHLY' | 'ANNUAL'): number {
  const pricePerVehicle = planType === 'MONTHLY' ? MONTHLY_PRICE : ANNUAL_PRICE;
  return vehicleCount * pricePerVehicle;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function generateGoogleFormLink(vehicleId: string, vehicleNumber: string): string {
  // Template Google Form URL - driver should replace with actual form link
  return `https://docs.google.com/forms/d/e/SAMPLE_FORM_ID/viewform?usp=pp_url&entry.vehicle_id=${vehicleId}&entry.vehicle_number=${vehicleNumber}`;
}

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Delhi', 'Jammu and Kashmir',
  'Ladakh', 'Lakshadweep', 'Puducherry'
];
