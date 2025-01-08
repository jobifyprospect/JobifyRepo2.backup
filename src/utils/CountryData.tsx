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
      'Region I - Ilocos Region ': {
        Provinces: {
          'Ilocos Norte': {
            Cities: ['Laoag City', 'Batac City', 'Paoay', 'Pagudpud', 'Sarrat'],
          },
          'Ilocos Sur': {
            Cities: ['Vigan City', 'Candon City', 'Tagudin', 'Suyo', 'Sinait'],
          },
        },
      },
      'Region II - Cagayan Valley': {
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
      'Region III - Central Luzon': {
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
      'Region IV-A - CALABARZON': {
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
      'Region V - Bicol Region': {
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
      'Region VI - Western Visayas': {
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
      'Region VII - Central Visayas': {
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
      'Region VIII - Eastern Visayas': {
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
      'Region IX - Zamboanga Peninsula': {
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
      'Region X - Northern Mindanao': {
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
      'Region XI - Davao Region': {
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
      'Region XII - SOCCSKSARGEN': {
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
      'Region XIII - Caraga': {
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
      'NCR - National Capital Region': {
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
      'CAR - Cordillera Administrative Region': {
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
      'BARMM - Bangsamoro Autonomous Region in Muslim Mindanao': {
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
    },
  },
};

export default countryData;
