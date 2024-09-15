// TODO define all country data
type Province = {
  [key: string]: {
    Cities: string[];
  };
};

type Region = {
  [key: string]: {
    Provinces: Province;
  };
};

type CountryData = {
  [key: string]: {
    Regions: Region;
  };
};

// Define the complete data structure for the Philippines
export const countryData: CountryData = {
  Philippines: {
    Regions: {
      'Ilocos Region': {
        Provinces: {
          'Ilocos Norte': {
            Cities: ['Laoag City', 'Batac City', 'Paoay', 'Pagudpud', 'Sarrat'],
          },
          'Ilocos Sur': {
            Cities: ['Vigan City', 'Candon City', 'Tagudin', 'Suyo', 'Sinait'],
          },
        },
      },
      'Cagayan Valley': {
        Provinces: {
          Cagayan: {
            Cities: [
              'Tuguegarao City',
              'Ilagan City',
              'Aparri',
              'Piat',
              'Gattaran',
            ],
          },
          Isabela: {
            Cities: [
              'Ilagan City',
              'Cauayan City',
              'Santiago City',
              'Alicia',
              'Roxas',
            ],
          },
          'Nueva Vizcaya': {
            Cities: [
              'Bayombong',
              'Solano',
              'Aritao',
              'Dupax del Norte',
              'Dupax del Sur',
            ],
          },
          Quirino: {
            Cities: [
              'Cabarroguis',
              'Diffun',
              'Nagtipunan',
              'Maddela',
              'Saguday',
            ],
          },
        },
      },
      'Central Luzon': {
        Provinces: {
          Aurora: {
            Cities: [
              'Baler',
              'Casiguran',
              'Dingalan',
              'Maria Aurora',
              'Dipaculao',
            ],
          },
          Bataan: {
            Cities: [
              'Balanga City',
              'Orani',
              'Dinalupihan',
              'Hermosa',
              'Pilar',
            ],
          },
          Bulacan: {
            Cities: [
              'Malolos City',
              'Meycauayan City',
              'San Jose del Monte',
              'Marilao',
              'Bocaue',
            ],
          },
          'Nueva Ecija': {
            Cities: [
              'Palayan City',
              'Gapan City',
              'Cabanatuan City',
              'San Jose City',
              'Talavera',
            ],
          },
          Pampanga: {
            Cities: [
              'San Fernando',
              'Angeles City',
              'Mabalacat',
              'Apalit',
              'Masantol',
            ],
          },
          Tarlac: {
            Cities: ['Tarlac City', 'Paniqui', 'Concepcion', 'Capas', 'Gerona'],
          },
        },
      },
      'Southern Tagalog': {
        Provinces: {
          Batangas: {
            Cities: [
              'Batangas City',
              'Lipa City',
              'Tanauan City',
              'Nasugbu',
              'Lemery',
            ],
          },
          Cavite: {
            Cities: ['Cavite City', 'Dasmariñas', 'Tagaytay', 'Imus', 'Bacoor'],
          },
          Laguna: {
            Cities: [
              'Santa Rosa',
              'San Pablo City',
              'Calamba City',
              'San Pedro',
              'Biñan',
            ],
          },
          Quezon: {
            Cities: [
              'Lucena City',
              'Tiaong',
              'Candelaria',
              'Sariaya',
              'Mauban',
            ],
          },
          Rizal: {
            Cities: ['Antipolo', 'Rodriguez', 'Taytay', 'Cainta', 'Binangonan'],
          },
        },
      },
      'Bicol Region': {
        Provinces: {
          Albay: {
            Cities: [
              'Legazpi City',
              'Tabaco City',
              'Ligao City',
              'Daraga',
              'Malilipot',
            ],
          },
          'Camarines Norte': {
            Cities: ['Daet', 'Mercedes', 'Labo', 'Basud', 'San Vicente'],
          },
          'Camarines Sur': {
            Cities: ['Naga City', 'Iriga City', 'Pili', 'Baao', 'Libmanan'],
          },
          Catanduanes: {
            Cities: ['Virac', 'Pandan', 'Caramoran', 'Bato', 'San Andres'],
          },
          Sorsogon: {
            Cities: [
              'Sorsogon City',
              'Sorsogon',
              'Bulusan',
              'Irosin',
              'Magallanes',
            ],
          },
        },
      },
      Visayas: {
        Provinces: {
          Bohol: {
            Cities: [
              'Tagbilaran City',
              'Dauis',
              'Tubigon',
              'Maribojoc',
              'Panglao',
            ],
          },
          Cebu: {
            Cities: [
              'Cebu City',
              'Lapu-Lapu City',
              'Mandaue City',
              'Talisay City',
              'Carcar City',
            ],
          },
          Iloilo: {
            Cities: ['Iloilo City', 'Passi City', 'Oton', 'Jaro', 'Leganes'],
          },
          Leyte: {
            Cities: [
              'Tacloban City',
              'Ormoc City',
              'Palo',
              'Baybay City',
              'Jaro',
            ],
          },
          'Negros Occidental': {
            Cities: [
              'Bacolod City',
              'Silay City',
              'Talisay City',
              'Escalante City',
              'San Carlos City',
            ],
          },
          'Negros Oriental': {
            Cities: [
              'Dumaguete City',
              'Bais City',
              'Bayawan City',
              'Guihulngan City',
              'Tanjay City',
            ],
          },
        },
      },
      Mindanao: {
        Provinces: {
          Bukidnon: {
            Cities: [
              'Malaybalay City',
              'Valencia City',
              'Maramag',
              'Manolo Fortich',
              'Libona',
            ],
          },
          Davao: {
            Cities: [
              'Davao City',
              'Tagum City',
              'Panabo City',
              'Digos City',
              'Samal City',
            ],
          },
          'Misamis Oriental': {
            Cities: [
              'Cagayan de Oro City',
              'Gingoog City',
              'El Salvador City',
              'Villanueva',
              'Oroquieta City',
            ],
          },
          'Zamboanga del Norte': {
            Cities: [
              'Dipolog City',
              'Dapitan City',
              'Sergio Osmeña Sr.',
              'Jose Dalman',
              'Siayan',
            ],
          },
          'Zamboanga del Sur': {
            Cities: [
              'Pagadian City',
              'Zamboanga City',
              'Tukuran',
              'Dimataling',
              'Labangan',
            ],
          },
          'Lanao del Norte': {
            Cities: [
              'Iligan City',
              'Kapatagan',
              'Balo-i',
              'Linamon',
              'Sultan Naga Dimaporo',
            ],
          },
          'Lanao del Sur': {
            Cities: [
              'Marawi City',
              'Buadiposo-Buntong',
              'Masiu',
              'Lumba-Bayabao',
              'Ganassi',
            ],
          },
          Sulu: {
            Cities: ['Jolo', 'Patikul', 'Talipao', 'Maimbung', 'Indanan'],
          },
          'Tawi-Tawi': {
            Cities: ['Bongao', 'Mapun', 'Sapa-Sapa', 'Languyan', 'Sitangkai'],
          },
        },
      },
    },
  },
};

export default countryData;
