import { DestinationKnowledgeProvider } from "./knowledge-provider";
import { DestinationKnowledge, Attraction, NearbyRecommendations } from "../types";

const MOCK_DESTINATIONS: Record<string, DestinationKnowledge> = {
  agra: {
    destination: "Agra",
    country: "India",
    region: "Uttar Pradesh",
    coordinates: { lat: 27.1767, lng: 78.0081 },
    language: "Hindi, English",
    currency: "INR",
    timezone: "GMT+5:30",
    bestSeason: "October to March",
    safetyScore: 82,
    crowdLevels: "high",
    weatherSummary: "Mild winters (10-25°C), extremely hot summers (35-45°C). Monsoons from July to September.",
    visaNotes: "e-Visa available for most nationalities; must be applied for at least 4 days in advance.",
    emergencyContacts: { police: "112", medical: "102", fire: "101" },
    transportation: ["Auto-rickshaws", "Cycle-rickshaws", "Ola Cabs", "Tonga rides near Taj Mahal"],
    averageCosts: { accommodation: "$40/night", food: "$12/day", transit: "$6/day", sightseeing: "$25/day" },
    mustVisitAttractions: [
      { title: "Taj Mahal", description: "The iconic white marble mausoleum built by Emperor Shah Jahan in memory of his favorite wife.", cost: "$15", averageVisitDuration: "3h", bestTimeOfDay: "sunrise", coordinates: { lat: 27.1751, lng: 78.0421 }, openingHours: "06:00 AM - 07:00 PM (Closed on Fridays)" },
      { title: "Agra Fort", description: "A massive 16th-century red sandstone fortress that served as the main residence of the Mughal Emperors.", cost: "$8", averageVisitDuration: "2h", bestTimeOfDay: "morning", coordinates: { lat: 27.1795, lng: 78.0211 }, openingHours: "06:00 AM - 06:00 PM" },
      { title: "Fatehpur Sikri", description: "A historic fortified city founded in 1569 by Emperor Akbar, located 40km from Agra. Home to Buland Darwaza.", cost: "$8", averageVisitDuration: "3h", bestTimeOfDay: "afternoon", coordinates: { lat: 27.0945, lng: 77.6675 }, openingHours: "06:00 AM - 06:00 PM" },
      { title: "Mehtab Bagh", description: "The Moonlight Garden located opposite the Taj Mahal across the Yamuna River, offering iconic view options.", cost: "$4", averageVisitDuration: "1.5h", bestTimeOfDay: "sunset", coordinates: { lat: 27.1798, lng: 78.0435 }, openingHours: "06:00 AM - 06:00 PM" },
      { title: "Itmad-ud-Daulah", description: "Often called the 'Baby Taj', this exquisite marble tomb was built for Mumtaz Mahal's grandfather.", cost: "$4", averageVisitDuration: "1h", bestTimeOfDay: "morning", coordinates: { lat: 27.1928, lng: 78.0315 }, openingHours: "06:00 AM - 06:00 PM" },
      { title: "Jama Masjid", description: "A beautifully decorated 17th-century mosque built by Shah Jahan's daughter Jahanara Begum.", cost: "Free", averageVisitDuration: "1h", bestTimeOfDay: "afternoon", coordinates: { lat: 27.1812, lng: 78.0162 }, openingHours: "05:00 AM - 09:00 PM" }
    ],
    hiddenGems: [
      { title: "Sheroes Hangout", description: "A heartwarming, activist-run cafe managed by courageous survivors of acid attacks, offering tasty snacks and stories.", cost: "Pay what you wish", averageVisitDuration: "1h", bestTimeOfDay: "afternoon", coordinates: { lat: 27.1652, lng: 78.0385 }, openingHours: "09:00 AM - 10:00 PM" },
      { title: "Korai Village", description: "A tribal hamlet on the outskirts of Agra showing the lifestyle of the Kalandar community.", cost: "$10", averageVisitDuration: "2h", bestTimeOfDay: "morning", coordinates: { lat: 27.1121, lng: 77.8202 }, openingHours: "08:00 AM - 05:00 PM" },
      { title: "Chini Ka Rauza", description: "Tomb of Afzal Khan, a poet-scholar, decorated with brilliant glazed Persian tiles.", cost: "Free", averageVisitDuration: "1h", bestTimeOfDay: "afternoon", coordinates: { lat: 27.2012, lng: 78.0411 }, openingHours: "06:00 AM - 06:00 PM" },
      { title: "Keetham Lake", description: "A peaceful lake and scenic bird sanctuary, also hosting the Agra Bear Rescue Facility.", cost: "$5", averageVisitDuration: "3h", bestTimeOfDay: "morning", coordinates: { lat: 27.2512, lng: 77.8415 }, openingHours: "06:00 AM - 06:00 PM" },
      { title: "Mughal Heritage Walk", description: "A community-based tourism initiative taking visitors through historic Kachhpura village with views of the Taj.", cost: "$12", averageVisitDuration: "2h", bestTimeOfDay: "sunset", coordinates: { lat: 27.1821, lng: 78.0452 }, openingHours: "07:00 AM - 06:00 PM" }
    ],
    dining: {
      streetFood: [
        { name: "Deviram Sweets", cuisine: "Bedai & Jalebi", averageCost: "$2/person", description: "Famous local spot serving crisp Bedai (spiced lentil flatbreads) with hot, syrupy Jalebis." },
        { name: "Panchi Petha Shop", cuisine: "Traditional Petha", averageCost: "$3/box", description: "The original shop selling Agra's signature sweet made of ash gourd, available in diverse flavors." }
      ],
      fineDining: [
        { name: "Peshawri (ITC Mughal)", cuisine: "Mughlai & North Indian", averageCost: "$45/person", description: "Award-winning restaurant offering rich tandoori preparations, slow-cooked lentils, and flatbreads." }
      ],
      cafes: [
        { name: "Salt Cafe Kitchen & Bar", cuisine: "Multi-cuisine", averageCost: "$12/person", description: "Trendy rooftop cafe offering views of the Taj Mahal and refreshing mocktails." }
      ]
    },
    nightlife: ["Taj Khema cultural shows", "Mughal Tavern live music", "Sanskriti local dance shows"],
    adventureActivities: ["Hot air balloon rides overlooking Taj", "Yamuna river boat tours", "Cycling tour of Agra rural backroads"],
    museums: ["Taj Museum", "Mughal Museum (Upcoming)", "Spiritual Museum"],
    parks: ["Taj Nature Walk", "Shah Jahan Park", "Paliwal Park"],
    temples: ["Mankameshwar Temple", "Balkeshwar Temple", "Kailash Temple"],
    historicalSites: ["Taj Mahal", "Agra Fort", "Fatehpur Sikri", "Akbar's Tomb Sikandra", "Mariam's Tomb"],
    shoppingAreas: ["Sadar Bazaar", "Kinari Bazaar", "Shahganj Bazaar"],
    markets: ["Sadar Bazaar Market", "Kinari Spice & Textile Market", "Taj Ganj Crafts Market"],
    soloExperiences: ["Mughal Heritage Village Walk", "Volunteer morning at Wildlife SOS rescue camp"],
    coupleExperiences: ["Sunset view from Mehtab Bagh", "Private candlelight dinner overlooking Taj"],
    familyAttractions: ["Keetham Lake picnic & Bear Rescue camp visit", "Light and Sound show at Agra Fort"],
    luxuryExperiences: ["Stay at The Oberoi Amarvilas with direct views", "Private historian tour of Fatehpur Sikri"],
    budgetExperiences: ["Local street food crawl", "Watching Taj sunset from Taj Khema mounds"],
    localFestivals: ["Taj Mahotsav (February)", "Ram Barat (October)", "Bateshwar Fair (November)"],
    travelTips: {
      touristScams: ["Beware of unlicensed guides offering 'skip-the-line' tickets at Taj Mahal", "Avoid rickshaw drivers pushing overpriced souvenir emporiums", "Double check jewelry certificates at local gemstone shops"],
      packingTips: ["Modest clothing covering shoulders and knees for religious visits", "Comfortable walking shoes", "Sunscreen, sunglasses, and a wide-brim hat"],
      generalTips: ["Taj Mahal is closed on Fridays. Buy tickets online in advance.", "Hire only government-approved guides with valid ID cards.", "Foreign tourists receive a discount coupon on buying Taj tickets."]
    },
    popularityScore: 98,
    userRating: 4.8,
    nearbyRecommendations: {
      "Taj Mahal": {
        cafes: ["Sheroes Hangout (5m walk)", "Joney's Place (4m walk)"],
        restaurants: ["Pinch of Spice (10m drive)", "Taj Bano (ITC Mughal) (5m drive)"],
        restrooms: ["Taj Mahal Visitor Center (2m walk)", "East Gate Ticket Counter restrooms"],
        parking: ["Shilpgram Parking Lot (800m away, electric shuttle available)"],
        metroStations: ["Taj East Gate Station (1.2 km away)"],
        emergencyServices: ["Taj Ganj Police Station (800m away)", "Agra District Hospital (4 km away)"]
      },
      "Agra Fort": {
        cafes: ["Cafe Sheroes (7m drive)", "Costa Coffee Sadar (10m drive)"],
        restaurants: ["Peshawri (ITC) (8m drive)", "Chimney Salad (5m walk)"],
        restrooms: ["Agra Fort Ticket Lounge (1m walk)", "Fort Interior courtyard restrooms"],
        parking: ["Agra Fort Main Entrance Parking (100m away)"],
        metroStations: ["Agra Fort Metro Station (200m away)"],
        emergencyServices: ["Fort Police Outpost (50m away)", "Agra Cantonment Hospital (3 km away)"]
      }
    }
  },
  paris: {
    destination: "Paris",
    country: "France",
    region: "Île-de-France",
    coordinates: { lat: 48.8566, lng: 2.3522 },
    language: "French",
    currency: "EUR",
    timezone: "GMT+1 (CET)",
    bestSeason: "April to June, September to October",
    safetyScore: 85,
    crowdLevels: "high",
    weatherSummary: "Temperate climate. Mild spring/autumn (12-22°C), warm summers (20-30°C), cool winters (3-8°C).",
    visaNotes: "Schengen Visa required for non-EU travelers; passport must be valid for 3+ months beyond departure.",
    emergencyContacts: { police: "17", medical: "15", fire: "18" },
    transportation: ["Metro", "RER Trains", "Vélib' (bikeshare)", "Buses"],
    averageCosts: { accommodation: "$150/night", food: "$40/day", transit: "$10/day", sightseeing: "$35/day" },
    mustVisitAttractions: [
      { title: "Eiffel Tower", description: "The iconic wrought-iron lattice tower on the Champ de Mars, named after engineer Gustave Eiffel.", cost: "$28", averageVisitDuration: "2h", bestTimeOfDay: "afternoon", coordinates: { lat: 48.8584, lng: 2.2945 }, openingHours: "09:30 AM - 11:45 PM" },
      { title: "Louvre Museum", description: "The world's largest art museum and historic monument, home to the Mona Lisa and Venus de Milo.", cost: "$22", averageVisitDuration: "4h", bestTimeOfDay: "morning", coordinates: { lat: 48.8606, lng: 2.3376 }, openingHours: "09:00 AM - 06:00 PM (Closed on Tuesdays)" },
      { title: "Notre Dame Cathedral", description: "A historic Catholic cathedral on the Île de la Cité, a masterpiece of French Gothic architecture.", cost: "Free", averageVisitDuration: "1h", bestTimeOfDay: "morning", coordinates: { lat: 48.8530, lng: 2.3499 }, openingHours: "08:00 AM - 06:45 PM" },
      { title: "Montmartre", description: "A historic hill district known for its artistic history, the white-domed Sacré-Cœur Basilica, and sweeping views.", cost: "Free", averageVisitDuration: "3h", bestTimeOfDay: "sunset", coordinates: { lat: 48.8867, lng: 2.3431 }, openingHours: "24/7 (Basilica open 06:00 AM - 10:30 PM)" }
    ],
    hiddenGems: [
      { title: "Shakespeare and Company", description: "The legendary English-language bookstore on the Left Bank, a gathering place for writers since the 1920s.", cost: "Free", averageVisitDuration: "1h", bestTimeOfDay: "morning", coordinates: { lat: 48.8526, lng: 2.3471 }, openingHours: "10:00 AM - 08:00 PM" },
      { title: "Promenade Plantée", description: "The world's first elevated parkway, built on a historic railway viaduct, lined with beautiful flowers and views.", cost: "Free", averageVisitDuration: "2h", bestTimeOfDay: "morning", coordinates: { lat: 48.8471, lng: 2.3745 }, openingHours: "08:00 AM - 07:30 PM" }
    ],
    dining: {
      streetFood: [
        { name: "L'As du Fallafel", cuisine: "Middle Eastern Fallafel", averageCost: "$10/person", description: "Famous falafel shop in the historic Jewish quarter of Le Marais." }
      ],
      fineDining: [
        { name: "Le Jules Verne", cuisine: "Modern French Gastronomy", averageCost: "$180/person", description: "Michelin-starred restaurant located on the second platform of the Eiffel Tower." }
      ],
      cafes: [
        { name: "Café de Flore", cuisine: "Classic Parisian Cafe", averageCost: "$15/person", description: "Historic cafe in Saint-Germain-des-Prés, famous for its intellectual and artistic clientele." }
      ]
    },
    nightlife: ["Seine river night cruises", "Pigalle cabaret bars (Moulin Rouge)", "Latin Quarter jazz clubs"],
    adventureActivities: ["Paris canal boat exploration", "Catacombs night tours", "Vélib' bicycle city tour at midnight"],
    museums: ["Louvre", "Musée d'Orsay", "Centre Pompidou", "Musée de l'Orangerie"],
    parks: ["Jardin du Luxembourg", "Tuileries Garden", "Parc des Buttes-Chaumont"],
    temples: ["Sainte-Chapelle", "Sacré-Cœur", "Saint-Sulpice"],
    historicalSites: ["Eiffel Tower", "Arc de Triomphe", "Panthéon", "Les Invalides"],
    shoppingAreas: ["Champs-Élysées", "Boulevard Haussmann (Galeries Lafayette)", "Le Marais boutiques"],
    markets: ["Marché d'Aligre", "Marché des Enfants Rouges", "Marché aux Puces de Saint-Ouen"],
    soloExperiences: ["Browsing the Bouquinistes riverside bookstalls", "Wandering the cobblestones of Latin Quarter"],
    coupleExperiences: ["Sunset at Sacré-Cœur steps", "Private cruise on the Seine with champagne"],
    familyAttractions: ["Jardin du Luxembourg toy sailboat sailing", "Science Museum at Parc de la Villette"],
    luxuryExperiences: ["Private evening tour of the Louvre", "Shopping experience at Place Vendôme jewelry houses"],
    budgetExperiences: ["Picnic with baguette and wine at Canal Saint-Martin", "Free admission Sunday museum crawls"],
    localFestivals: ["Fête de la Musique (June)", "Nuit Blanche (October)", "Paris Plages (July-August)"],
    travelTips: {
      touristScams: ["Avoid the 'friendship bracelet' weavers around Montmartre steps", "Ignore pickpockets operating near the Louvre entrances", "Never sign petitions from street gatherers around Eiffel Tower"],
      packingTips: ["Smart-casual dress code for restaurants", "Comfortable walking shoes", "Compact travel umbrella"],
      generalTips: ["Book Eiffel Tower and Louvre tickets months in advance.", "Learn basic French greetings (Bonjour, Merci, S'il vous plaît).", "Tipping is included in restaurant bills, but leaving small coins is appreciated."]
    },
    popularityScore: 99,
    userRating: 4.7,
    nearbyRecommendations: {
      "Eiffel Tower": {
        cafes: ["Kitsuné Cafe (8m walk)", "Caretti Paris (6m walk)"],
        restaurants: ["Le Jules Verne (0m away)", "L'Ami Jean (10m walk)"],
        restrooms: ["Champ de Mars public cubicles (1m walk)", "Eiffel Tower pillar restrooms"],
        parking: ["Parking Indigo Eiffel (200m away)"],
        metroStations: ["Bir-Hakeim Station (Line 6) (5m walk)", "Champ de Mars Tour Eiffel Station (RER C)"],
        emergencyServices: ["Eiffel Tower Security Center (50m away)", "Hôpital Necker (2.5 km away)"]
      }
    }
  },
  tokyo: {
    destination: "Tokyo",
    country: "Japan",
    region: "Kanto",
    coordinates: { lat: 35.6762, lng: 139.6503 },
    language: "Japanese",
    currency: "JPY",
    timezone: "GMT+9",
    bestSeason: "March to May (Sakura), October to December (Autumn Leaves)",
    safetyScore: 97,
    crowdLevels: "high",
    weatherSummary: "Hot, humid summers (25-33°C). Crisp, sunny winters (2-10°C). Beautiful cherry blossom spring.",
    visaNotes: "Visa-free entry for up to 90 days for over 60 nationalities; passports must be valid for duration of stay.",
    emergencyContacts: { police: "110", medical: "119", fire: "119" },
    transportation: ["Tokyo Metro", "JR Yamanote Line", "Toei Subway", "Suica/Pasmo IC Cards"],
    averageCosts: { accommodation: "$120/night", food: "$30/day", transit: "$8/day", sightseeing: "$20/day" },
    mustVisitAttractions: [
      { title: "Shibuya Crossing", description: "The famous intersection and busiest pedestrian crossing in the world, surrounded by neon screens.", cost: "Free", averageVisitDuration: "1h", bestTimeOfDay: "night", coordinates: { lat: 35.6595, lng: 139.7005 }, openingHours: "24/7" },
      { title: "Asakusa Temple (Senso-ji)", description: "Tokyo's oldest and most significant Buddhist temple, featuring the massive Kaminarimon Gate.", cost: "Free", averageVisitDuration: "1.5h", bestTimeOfDay: "morning", coordinates: { lat: 35.7148, lng: 139.7967 }, openingHours: "06:00 AM - 05:00 PM (Grounds open 24/7)" },
      { title: "Akihabara Electric Town", description: "The world-famous center of Otaku culture, anime shops, video game arcades, and electronic stores.", cost: "Free", averageVisitDuration: "3h", bestTimeOfDay: "afternoon", coordinates: { lat: 35.6997, lng: 139.7715 }, openingHours: "10:00 AM - 08:00 PM" },
      { title: "teamLab Planets", description: "An incredible sensory museum where visitors walk through water and immersive digital art rooms.", cost: "$32", averageVisitDuration: "2h", bestTimeOfDay: "morning", coordinates: { lat: 35.6491, lng: 139.7898 }, openingHours: "09:00 AM - 10:00 PM" }
    ],
    hiddenGems: [
      { title: "Yanaka Ginza", description: "A retro, low-rise shopping street preserved since the mid-20th century, famous for street snacks and cats.", cost: "Free", averageVisitDuration: "1.5h", bestTimeOfDay: "afternoon", coordinates: { lat: 35.7278, lng: 139.7681 }, openingHours: "10:00 AM - 06:00 PM" },
      { title: "Golden Gai", description: "A network of six narrow alleys lined with over 200 tiny, themed micro-bars in the heart of Shinjuku.", cost: "$5 cover charge typical", averageVisitDuration: "2h", bestTimeOfDay: "night", coordinates: { lat: 35.6939, lng: 139.7048 }, openingHours: "07:00 PM - 03:00 AM" }
    ],
    dining: {
      streetFood: [
        { name: "Gindaco Asakusa", cuisine: "Takoyaki", averageCost: "$5/person", description: "Popular spot serving crisp octopus balls topped with savory sauce, mayo, and bonito flakes." }
      ],
      fineDining: [
        { name: "Sukiyabashi Jiro Roppongi", cuisine: "Edomae Sushi", averageCost: "$250/person", description: "Michelin-starred sushi counter offering a pristine chef's choice omakase tasting menu." }
      ],
      cafes: [
        { name: "Chatei Hatou", cuisine: "Specialty Pour-over Coffee", averageCost: "$10/person", description: "Famous retro kissaten cafe serving masterfully crafted hand-drip coffee in unique cups." }
      ]
    },
    nightlife: ["Shinjuku bar hopping", "Roppongi dance clubs", "Shibuya neon karaoke bars"],
    adventureActivities: ["Mario-style street karting through Shibuya", "Summiting Tokyo Skytree lookout", "Biking across Rainbow Bridge at sunset"],
    museums: ["Tokyo National Museum", "Ghibli Museum", "Mori Art Museum"],
    parks: ["Shinjuku Gyoen", "Yoyogi Park", "Ueno Park"],
    temples: ["Senso-ji", "Meiji Shrine", "Zojo-ji"],
    historicalSites: ["Imperial Palace East Gardens", "Edo-Tokyo Museum", "Hamarikyu Gardens"],
    shoppingAreas: ["Ginza luxury street", "Harajuku Takeshita Street", "Shibuya 109"],
    markets: ["Tsukiji Outer Market", "Toyosu Tuna Market", "Ameyoko Street Market"],
    soloExperiences: ["Dining in a private Ichiran Ramen booth", "Staying in a capsule hotel in Shinjuku"],
    coupleExperiences: ["Viewing sunset from Shibuya Sky deck", "Strolling under Meguro River cherry blossoms"],
    familyAttractions: ["Sanrio Puroland (Hello Kitty Land)", "Tokyo Disneyland & DisneySea"],
    luxuryExperiences: ["Helicopter tour over Tokyo Bay", "Private tea ceremony in Hamarikyu gardens"],
    budgetExperiences: ["Buying bento boxes from convenience stores for park picnics", "Free city views from Tokyo Metropolitan Gov Building"],
    localFestivals: ["Sanja Matsuri (May)", "Kanda Matsuri (May)", "Sumida River Fireworks (July)"],
    travelTips: {
      touristScams: ["Avoid street touts in Roppongi/Kabukicho offering 'cheap drinks' with hidden fees", "Do not accept free bar tours from promoters on the street", "Always check the cover charge before entering small Izakayas"],
      packingTips: ["Slip-on shoes for frequent shoe-removal at temples/restaurants", "Pocket Wi-Fi or eSIM for navigating streets", "A small towel for drying hands (restrooms rarely have paper towels)"],
      generalTips: ["Trash cans are extremely rare in public. Carry your garbage with you.", "Walk on the left side of escalators in Tokyo (right side in Osaka).", "Eating while walking is considered bad manners; consume food near shops."]
    },
    popularityScore: 99,
    userRating: 4.9,
    nearbyRecommendations: {
      "Shibuya Crossing": {
        cafes: ["Starbucks Shibuya Tsutaya (1m walk)", "L'Occitane Cafe (2m walk)"],
        restaurants: ["Ichiran Shibuya (4m walk)", "Shibuya Mark City Dining (3m walk)"],
        restrooms: ["Shibuya Station Central Gate Restrooms (1m walk)", "Shibuya Hikarie Mall restrooms"],
        parking: ["Shibuya Station underground parking (100m away)"],
        metroStations: ["JR Shibuya Station (1m walk)", "Shibuya Subway (Hanzomon/Fukutoshin Lines)"],
        emergencyServices: ["Shibuya Crossing Koban (Police Box) (20m away)", "Tokyo Metropolitan Hiroo Hospital (2.5 km away)"]
      }
    }
  },
  ladakh: {
    destination: "Ladakh",
    country: "India",
    region: "Jammu and Kashmir",
    coordinates: { lat: 34.1526, lng: 77.5771 },
    language: "Ladakhi, Tibetan, Hindi, English",
    currency: "INR",
    timezone: "GMT+5:30",
    bestSeason: "June to September",
    safetyScore: 91,
    crowdLevels: "low",
    weatherSummary: "High altitude cold desert. Cool summers (15-25°C), freezing winters (-10 to -25°C). Minimum rainfall.",
    visaNotes: "Inner Line Permit (ILP) required for both domestic and international tourists to visit protected border zones like Pangong and Nubra.",
    emergencyContacts: { police: "100", medical: "102", fire: "101" },
    transportation: ["Shared Taxi", "Private Bullet/Bikes", "Local Bus"],
    averageCosts: { accommodation: "$35/night", food: "$10/day", transit: "$15/day", sightseeing: "$5/day" },
    mustVisitAttractions: [
      { title: "Pangong Lake", description: "A high-altitude endorheic lake famous for its changing colors, stretching from India to China.", cost: "$1", averageVisitDuration: "4h", bestTimeOfDay: "sunrise", coordinates: { lat: 34.0259, lng: 78.4735 }, openingHours: "24/7" },
      { title: "Nubra Valley", description: "A cold high-altitude desert famous for its sand dunes, Bactrian double-humped camels, and Diskit Monastery.", cost: "$2", averageVisitDuration: "5h", bestTimeOfDay: "afternoon", coordinates: { lat: 34.5828, lng: 77.5583 }, openingHours: "24/7" },
      { title: "Khardung La", description: "One of the highest motorable mountain passes in the world, situated at 5,359 meters elevation.", cost: "Free", averageVisitDuration: "45m", bestTimeOfDay: "morning", coordinates: { lat: 34.2787, lng: 77.6047 }, openingHours: "24/7" },
      { title: "Magnetic Hill", description: "A gravity hill where vehicles appear to roll uphill against gravity, surrounded by stunning vistas.", cost: "Free", averageVisitDuration: "1h", bestTimeOfDay: "afternoon", coordinates: { lat: 34.1685, lng: 77.4208 }, openingHours: "24/7" }
    ],
    hiddenGems: [
      { title: "Turtuk Village", description: "A beautiful, scenic Baltic village along the Shyok River near the Pakistan border, opened to tourists in 2010.", cost: "Free", averageVisitDuration: "3h", bestTimeOfDay: "morning", coordinates: { lat: 34.8452, lng: 76.8335 }, openingHours: "24/7" },
      { title: "Lamayuru Moonland", description: "An astonishing geographical formation with lunar-like clay topography, hosting one of Ladakh's oldest monasteries.", cost: "Free", averageVisitDuration: "2h", bestTimeOfDay: "sunset", coordinates: { lat: 34.2831, lng: 76.7761 }, openingHours: "06:00 AM - 07:00 PM" }
    ],
    dining: {
      streetFood: [
        { name: "Leh Central Bakery", cuisine: "Ladakhi Apricot Jam & Bread", averageCost: "$1.5/person", description: "Small bakery serving fresh butter tea, wood-fired Ladakhi bread, and organic apricot jam." }
      ],
      fineDining: [
        { name: "The Tibetan Kitchen", cuisine: "Tibetan & Ladakhi", averageCost: "$10/person", description: "Traditional restaurant serving authentic mutton momos, Thukpa noodle soup, and Gyako hotpot." }
      ],
      cafes: [
        { name: "Leh Cafe Sol", cuisine: "Continental & Local", averageCost: "$5/person", description: "Relaxed travelers cafe serving organic coffee, local herbal teas, and wood-fired pizzas." }
      ]
    },
    nightlife: ["Star gazing in Pangong camps", "Cultural shows at Leh center", "Stok Heritage home dining"],
    adventureActivities: ["Rafting on the Zanskar River confluence", "Motorbiking Leh-Manali Highway", "Trekking Markha Valley passes"],
    museums: ["Hall of Fame Military Museum", "Stok Palace Museum", "Munshi House"],
    parks: ["Hemis National Park (Snow leopard reserve)", "Sindhu Ghat", "Leh Main Bazar Park"],
    temples: ["Hemis Monastery", "Thiksey Monastery", "Diskit Monastery", "Alchi Monastery"],
    historicalSites: ["Leh Palace", "Shey Palace", "Stok Palace", "Shanti Stupa"],
    shoppingAreas: ["Leh Main Bazar", "Tibetan Refugee Market", "Moti Market"],
    markets: ["Leh Main Bazar Handicrafts", "Women's Alliance Cooperative Market"],
    soloExperiences: ["Meditating at Thiksey Monastery morning prayers", "Motorcycling solo through Chang La pass"],
    coupleExperiences: ["Stargazing under the Milky Way at Nubra camps", "Scenic walk along Pangong shoreline"],
    familyAttractions: ["Meeting Bactrian camels in Hunder sand dunes", "Interactive exhibits at Hall of Fame"],
    luxuryExperiences: ["Staying at the premium Chamba Camp Diskit glamping", "Private customized helicopter charter over Zanskar valley"],
    budgetExperiences: ["Staying in homestays in Korzok village", "Eating hot Maggi at mountain passes"],
    localFestivals: ["Hemis Festival (June)", "Ladakh Festival (September)", "Losar New Year (December)"],
    travelTips: {
      touristScams: ["Beware of unlicensed bike rental operators offering faulty motorcycles", "Check local union rates before booking private taxis", "Avoid fake pashmina shawls sold in generic souvenir stalls"],
      packingTips: ["Acclimatization medication (Diamox)", "Thermal base layers, heavy down jackets, and windproof gloves", "UV protection sunglasses and high SPF sunscreen"],
      generalTips: ["Acclimatize in Leh for at least 36 hours before climbing passes.", "Prepaid mobile connections from other states do not work in Ladakh. Buy local BSNL/Airtel post-paid SIMs.", "Eco-tourism warning: Do not litter. Carry plastic bottles back to Leh."]
    },
    popularityScore: 92,
    userRating: 4.9,
    nearbyRecommendations: {
      "Pangong Lake": {
        cafes: ["Pangong Cafe sol (10m walk)", "Spangmik Maggi Point (5m walk)"],
        restaurants: ["Eco Homestay Diner (200m away)", "Pangong Lake View Restaurant (10m walk)"],
        restrooms: ["Spangmik Camp Site cubicles (100m away)", "Pangong Checkpost restrooms"],
        parking: ["Pangong Lake Shore Parking Area (50m away)"],
        metroStations: ["None (Nearest railway station is Jammu Tawi, 700km away)"],
        emergencyServices: ["Tangste Medical Outpost (45 km away)", "Tangste Police Station (45 km away)"]
      }
    }
  },
  jaipur: {
    destination: "Jaipur",
    country: "India",
    region: "Rajasthan",
    coordinates: { lat: 26.9124, lng: 75.7873 },
    language: "Hindi, Rajasthani, English",
    currency: "INR",
    timezone: "GMT+5:30",
    bestSeason: "November to February",
    safetyScore: 88,
    crowdLevels: "high",
    weatherSummary: "Warm, pleasant winters (10-25°C). Blistering summers (38-46°C). Short monsoon spells from July to September.",
    visaNotes: "e-Visa available for tourists, valid for 30 days to 5 years depending on type.",
    emergencyContacts: { police: "112", medical: "108", fire: "101" },
    transportation: ["E-rickshaws", "Uber Cabs", "Jaipur Metro", "Jaipur City Bus"],
    averageCosts: { accommodation: "$45/night", food: "$15/day", transit: "$8/day", sightseeing: "$20/day" },
    mustVisitAttractions: [
      { title: "Hawa Mahal", description: "The famous 'Palace of Winds' built in red and pink sandstone with 953 small casements.", cost: "$4", averageVisitDuration: "1h", bestTimeOfDay: "morning", coordinates: { lat: 26.9239, lng: 75.8267 }, openingHours: "09:00 AM - 04:30 PM" },
      { title: "Amer Fort", description: "A majestic hilltop fortress overlooking Maota Lake, famous for its artistic Hindu style elements.", cost: "$7", averageVisitDuration: "3h", bestTimeOfDay: "morning", coordinates: { lat: 26.9854, lng: 75.8513 }, openingHours: "08:00 AM - 05:30 PM (Night tour 07:00 PM - 10:00 PM)" },
      { title: "City Palace", description: "The royal seat of the Maharaja of Jaipur, featuring a stunning blend of Mughal and Rajput architecture.", cost: "$10", averageVisitDuration: "2h", bestTimeOfDay: "morning", coordinates: { lat: 26.9258, lng: 75.8236 }, openingHours: "09:30 AM - 05:00 PM (Night tour 07:00 PM - 10:00 PM)" },
      { title: "Jantar Mantar", description: "A UNESCO World Heritage site featuring the world's largest stone sundial and astronomical instruments.", cost: "$4", averageVisitDuration: "1.5h", bestTimeOfDay: "afternoon", coordinates: { lat: 26.9248, lng: 75.8245 }, openingHours: "09:00 AM - 04:30 PM" },
      { title: "Nahargarh Fort", description: "A historic fort standing on the edge of the Aravalli Hills, offering panoramic sunset views of the city.", cost: "$4", averageVisitDuration: "2h", bestTimeOfDay: "sunset", coordinates: { lat: 26.9374, lng: 75.8156 }, openingHours: "10:00 AM - 05:30 PM" },
      { title: "Jal Mahal", description: "The floating 'Water Palace' sitting in the center of Man Sagar Lake, showcasing striking Rajput architecture.", cost: "Free (View only from lakeside)", averageVisitDuration: "45m", bestTimeOfDay: "sunset", coordinates: { lat: 26.9654, lng: 75.8456 }, openingHours: "24/7 (Lakeside promenade open always)" }
    ],
    hiddenGems: [
      { title: "Panna Meena Ka Kund", description: "An ancient, highly photogenic eight-story stepwell famous for its symmetric zig-zag staircases.", cost: "Free", averageVisitDuration: "1h", bestTimeOfDay: "morning", coordinates: { lat: 26.9892, lng: 75.8532 }, openingHours: "06:00 AM - 06:00 PM" },
      { title: "Galta Ji (Monkey Temple)", description: "A unique prehistoric Hindu pilgrimage site featuring natural freshwater springs and bathing pools.", cost: "Free", averageVisitDuration: "2h", bestTimeOfDay: "afternoon", coordinates: { lat: 26.9168, lng: 75.8592 }, openingHours: "05:00 AM - 09:00 PM" },
      { title: "Amrapali Museum", description: "A unique museum displaying a spectacular collection of traditional Indian jewelry and silver artifacts.", cost: "$8", averageVisitDuration: "1.5h", bestTimeOfDay: "morning", coordinates: { lat: 26.9142, lng: 75.8012 }, openingHours: "10:00 AM - 06:00 PM" },
      { title: "Anokhi Museum", description: "A quaint museum housed in a restored mansion dedicated to the art of traditional hand-block printing.", cost: "$2", averageVisitDuration: "1.5h", bestTimeOfDay: "afternoon", coordinates: { lat: 26.9878, lng: 75.8542 }, openingHours: "10:30 AM - 05:00 PM" }
    ],
    dining: {
      streetFood: [
        { name: "LMB (Laxmi Mishthan Bhandar)", cuisine: "Pyaaz Kachori & Ghewar", averageCost: "$4/person", description: "Historic sweet shop serving spicy onion kachoris and sugary Rajasthani Ghewar." },
        { name: "Rawat Mishthan Bhandar", cuisine: "Pyaaz Kachori", averageCost: "$3/person", description: "Highly popular spot serving Jaipur's most famous and crispy onion kachoris." }
      ],
      fineDining: [
        { name: "1135 AD (Amer Fort)", cuisine: "Royal Rajasthani Thali", averageCost: "$35/person", description: "Fine dining restaurant inside the fort, serving royal Mughlai and Rajput recipes in gold-gilded halls." }
      ],
      cafes: [
        { name: "Wind View Cafe", cuisine: "Indian & Continental", averageCost: "$5/person", description: "Rooftop cafe located opposite the Hawa Mahal, offering the ultimate photo angle of the palace windows." }
      ]
    },
    nightlife: ["Light and Sound show at Amer Fort", "Drinks at Bar Palladio (glass room)", "Cultural evening at Chokhi Dhani"],
    adventureActivities: ["Hot air balloon flights over Jaipur forts", "Elefantastic elephant sanctuary interaction", "Cycling tour of Nahargarh hill road"],
    museums: ["Albert Hall Museum", "Amrapali Museum", "Anokhi Museum", "City Palace Museum"],
    parks: ["Kanak Vrindavan Gardens", "Central Park", "Jawahar Circle Park"],
    temples: ["Birla Mandir", "Govind Dev Ji Temple", "Moti Dungri Temple"],
    historicalSites: ["Hawa Mahal", "Amer Fort", "City Palace", "Nahargarh Fort", "Jaigarh Fort", "Jal Mahal"],
    shoppingAreas: ["Johari Bazar (Jewelry)", "Bapu Bazar (Textiles & Mojris)", "Tripolia Bazar (Lac Bangles)"],
    markets: ["Johari Bazar Market", "Bapu Bazar Crafts Market", "Chandpole Spice Market"],
    soloExperiences: ["Traditional block printing workshop in Sanganer", "Exploring the Albert Hall collection"],
    coupleExperiences: ["Sunset view from Nahargarh fort battlements", "Romantic dining in Amer Fort's 1135 AD courtyard"],
    familyAttractions: ["Cultural village experience at Chokhi Dhani", "Albert Hall pigeon feeding and evening lighting"],
    luxuryExperiences: ["Stay at Taj Rambagh Palace", "Private vintage car tour of city forts"],
    budgetExperiences: ["Local street food crawl", "Watching City Palace light shows from public squares"],
    localFestivals: ["Jaipur Literature Festival (January)", "Teej Festival (August)", "Kite Festival (January)"],
    travelTips: {
      touristScams: ["Beware of gem sellers offering schemes to resell stones in your home country", "Avoid guides taking you to commission-heavy handicraft factories", "Negotiate rickshaw fares beforehand to avoid inflated rates"],
      packingTips: ["Cotton clothing for warm afternoons", "Sun protection accessories", "Modest shawl for temples"],
      generalTips: ["Composite tickets cover multiple sites at a discounted price.", "Carry small change for local market shopping.", "Most monuments close by 05:00 PM; plan visits early."]
    },
    popularityScore: 96,
    userRating: 4.8,
    nearbyRecommendations: {
      "Hawa Mahal": {
        cafes: ["Wind View Cafe (1m walk)", "Tattoo Cafe (1m walk)"],
        restaurants: ["LMB Restaurant (10m walk)", "Surya Mahal (15m drive)"],
        restrooms: ["Hawa Mahal Entrance public facilities (2m walk)", "Wind View Cafe restrooms"],
        parking: ["Johari Bazar roadside parking (avoid during peak hours; public lot is 300m away)"],
        metroStations: ["Badi Chopar Metro Station (2m walk)"],
        emergencyServices: ["Manak Chowk Police Station (200m away)", "SMS Hospital (3 km away)"]
      }
    }
  }
};

export class MockKnowledgeProvider implements DestinationKnowledgeProvider {
  name = "MockKnowledgeProvider";

  async fetchDestinationKnowledge(destination: string): Promise<DestinationKnowledge | null> {
    const key = destination.toLowerCase().trim().replace(/[^a-z0-9]/g, "");
    
    // Check key mapping or partial match
    const matchedKey = Object.keys(MOCK_DESTINATIONS).find(k => k === key || key.includes(k) || k.includes(key));
    if (matchedKey) {
      return MOCK_DESTINATIONS[matchedKey];
    }
    
    return null;
  }
}
