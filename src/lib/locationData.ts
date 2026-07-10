export const COUNTRIES_DATA = {
  "Afghanistan": ["Kabul", "Kandahar", "Herat", "Mazar-i-Sharif"],
  "Albania": ["Tirana", "Durrës", "Vlorë", "Elbasan"],
  "Algeria": ["Algiers", "Oran", "Constantine", "Annaba"],
  "Andorra": ["Andorra la Vella", "Escaldes-Engordany", "Encamp"],
  "Angola": ["Luanda", "Huambo", "Lobito", "Benguela"],
  "Argentina": ["Buenos Aires", "Córdoba", "Rosario", "Mendoza"],
  "Australia": ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide"],
  "Austria": ["Vienna", "Salzburg", "Innsbruck", "Graz"],
  "Bahamas": ["Nassau", "Freeport", "West End"],
  "Bahrain": ["Manama", "Riffa", "Muharraq"],
  "Bangladesh": ["Dhaka", "Chittagong", "Khulna", "Sylhet"],
  "Belgium": ["Brussels", "Antwerp", "Ghent", "Bruges"],
  "Brazil": ["São Paulo", "Rio de Janeiro", "Brasília", "Salvador"],
  "Canada": ["Toronto", "Vancouver", "Montreal", "Ottawa", "Calgary"],
  "China": ["Beijing", "Shanghai", "Guangzhou", "Shenzhen"],
  "Denmark": ["Copenhagen", "Aarhus", "Odense"],
  "Egypt": ["Cairo", "Alexandria", "Giza", "Shubra El Kheima"],
  "Ethiopia": ["Addis Ababa", "Dire Dawa", "Mek'ele"],
  "Finland": ["Helsinki", "Espoo", "Tampere"],
  "France": ["Paris", "Lyon", "Marseille", "Toulouse", "Nice"],
  "Germany": ["Berlin", "Munich", "Hamburg", "Frankfurt", "Cologne"],
  "Greece": ["Athens", "Thessaloniki", "Patras"],
  "India": ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata"],
  "Indonesia": ["Jakarta", "Surabaya", "Bandung", "Medan"],
  "Ireland": ["Dublin", "Cork", "Limerick", "Galway"],
  "Italy": ["Rome", "Milan", "Naples", "Turin", "Palermo"],
  "Japan": ["Tokyo", "Osaka", "Nagoya", "Yokohama"],
  "Kenya": ["Nairobi", "Mombasa", "Kisumu"],
  "Kuwait": ["Kuwait City", "Jahra", "Ahmadi"],
  "Lebanon": ["Beirut", "Tripoli", "Sidon"],
  "Malaysia": ["Kuala Lumpur", "George Town", "Ipoh"],
  "Mexico": ["Mexico City", "Guadalajara", "Monterrey"],
  "Netherlands": ["Amsterdam", "Rotterdam", "The Hague", "Utrecht"],
  "New Zealand": ["Auckland", "Wellington", "Christchurch"],
  "Nigeria": ["Lagos", "Kano", "Ibadan", "Abuja"],
  "Norway": ["Oslo", "Bergen", "Trondheim"],
  "Oman": ["Muscat", "Salalah", "Sohar"],
  "Pakistan": ["Karachi", "Lahore", "Islamabad", "Faisalabad"],
  "Philippines": ["Manila", "Quezon City", "Davao City"],
  "Portugal": ["Lisbon", "Porto", "Coimbra"],
  "Qatar": ["Doha", "Al Wakrah", "Al Khor"],
  "Russia": ["Moscow", "Saint Petersburg", "Novosibirsk"],
  "Saudi Arabia": ["Riyadh", "Jeddah", "Mecca", "Medina", "Dammam", "Tabuk", "Al Ahsa", "Qatif", "Khamis Mushait", "Najran"],
  "Singapore": ["Singapore"],
  "South Africa": ["Johannesburg", "Cape Town", "Durban", "Pretoria"],
  "South Korea": ["Seoul", "Busan", "Incheon"],
  "Spain": ["Madrid", "Barcelona", "Valencia", "Seville"],
  "Sri Lanka": ["Colombo", "Kandy", "Galle"],
  "Sweden": ["Stockholm", "Gothenburg", "Malmö"],
  "Switzerland": ["Zurich", "Geneva", "Basel", "Bern"],
  "Thailand": ["Bangkok", "Nonthaburi", "Nakhon Ratchasima"],
  "Turkey": ["Istanbul", "Ankara", "Izmir", "Bursa"],
  "United Arab Emirates": ["Dubai", "Abu Dhabi", "Sharjah", "Ajman"],
  "United Kingdom": ["London", "Birmingham", "Manchester", "Glasgow", "Edinburgh"],
  "United States": ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix"],
  "Vietnam": ["Ho Chi Minh City", "Hanoi", "Da Nang"]
};

export const HEIGHT_FT = [
  "5'0\"", "5'2\"", "5'4\"", "5'6\"", "5'8\"", "5'10\"", "6'0\"", "6'2\"", "6'4\"", "6'6\"", "6'8\"", "6'10\"", "7'0\""
];

export const AGE_OPTIONS = Array.from({ length: 65 - 18 + 1 }, (_, i) => (18 + i).toString());

export const WORLD_COUNTRIES = Object.keys(COUNTRIES_DATA).sort();

export const getCitiesForCountry = (country: string) => {
  return COUNTRIES_DATA[country as keyof typeof COUNTRIES_DATA] || [];
};
