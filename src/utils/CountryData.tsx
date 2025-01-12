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
      'Region I - Ilocos Region': {
        Provinces: {
          'Ilocos Norte': {
            Cities: [
              'Laoag City',
              'Batac City'
            ]
          },
          'Ilocos Sur': {
            Cities: [
              'Candon City',
              'Vigan City'
            ]
          },
          'La Union': {
            Cities: [
              'San Fernando City'
            ]
          },
          'Pangasinan': {
            Cities: [
              'Alaminos City',
              'Dagupan City',
              'San Carlos City',
              'Urdaneta City'
            ]
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
              'Dilasag',
              'Dinalungan',
              'Dipaculao',
              'Maria Aurora',
              'San Luis'
            ],
          },
          Bataan: {
            Cities: [
              'Abucay',
              'Bagac',
              'Dinalupihan',
              'Hermosa',
              'Limay',
              'Mariveles',
              'Morong',
              'Orani',
              'Orion',
              'Pilar',
              'Samal'
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
          Aklan: {
            Cities: [
              'Aklan',
              'Altavas',
              'Balete',
              'Banga',
              'Batan',
              'Buruanga',
              'Ibajay',
              'Kalibo',
              'Lezo',
              'Libacao',
              'Madalag',
              'Makato',
              'Malay',
              'Malinao',
              'Nabas',
              'New Washington',
              'Numancia',
              'Tangalan',
            ],
          },
          Antique: {
            Cities: [
              'Anini-y',
              'Barbaza',
              'Belison',
              'Bugasong',
              'Caluya',
              'Culasi',
              'Hamtic',
              'Laua-an',
              'Libertad',
              'Pandan',
              'Patnongon',
              'San Jose de Buenavista',
              'San Remigio',
              'Sebaste',
              'Sibalom',
              'Tibiao',
              'Tobias Fornier',
            ],
          },
          Capiz: {
            Cities: [
              'Roxas City',
              'Cuartero',
              'Dao',
              'Dumalag',
              'Dumarao',
              'Ivisan',
              'Jamindan',
              'Maayon',
              'Mambusao',
              'Panay',
              'Panitan',
              'Pilar',
              'Pontevedra',
              'President Roxas',
              'Sapian',
              'Sigma',
              'Tapaz',
            ],
          },
          Guimaras: {
            Cities: [
              'Buenavista',
              'Jordan',
              'Nueva Valencia',
              'San Lorenzo',
              'Sibunag',
            ],
          },
          Iloilo: {
            Cities: [
              'Iloilo City',
              'Passi City',
              'Ajuy',
              'Alimodian',
              'Anilao',
              'Badiangan',
              'Balasan',
              'Banate',
              'Barotac Nuevo',
              'Barotac Viejo',
              'Batad',
              'Bingawan',
              'Cabatuan',
              'Calinog',
              'Carles',
              'Concepcion',
              'Dingle',
              'Dueñas',
              'Dumangas',
              'Estancia',
              'Guimbal',
              'Igbaras',
              'Janiuay',
              'Lambunao',
              'Leganes',
              'Lemery',
              'Leon',
              'Maasin',
              'Miagao',
              'Mina',
              'New Lucena',
              'Oton',
              'Pavia',
              'Pototan',
              'San Dionisio',
              'San Enrique',
              'San Joaquin',
              'San Miguel',
              'Santa Barbara',
              'Sara',
              'Tigbauan',
              'Tubungan',
              'Zarraga',
            ],
          },
          'Negros Occidental': {
            Cities: [
              'Bacolod City',
              'Bago City',
              'Cadiz City',
              'Escalante City',
              'Himamaylan City',
              'Kabankalan City',
              'La Carlota City',
              'Sagay City',
              'San Carlos City',
              'Silay City',
              'Sipalay City',
              'Talisay City',
              'Victorias City',
              'Binalbagan',
              'Calatrava',
              'Candoni',
              'Cauayan',
              'Enrique B. Magalona',
              'Hinigaran',
              'Hinoba-an',
              'Ilog',
              'Isabela',
              'La Castellana',
              'Manapla',
              'Moises Padilla',
              'Murcia',
              'Pontevedra',
              'Pulupandan',
              'Salvador Benedicto',
              'San Enrique',
              'Toboso',
              'Valladolid',
            ],
          },
        },
      },
      'Region VII - Central Visayas': {
        Provinces: {
          Bohol: {
            Cities: [
              'Tagbilaran City',
              'Alburquerque',
              'Anda',
              'Antique',
              'Baclayon',
              'Batuan',
              'Bien Unido',
              'Bilar',
              'Carmen',
              'Catigbian',
              'Clarin',
              'Cortes',
              'Danao',
              'Dauis',
              'Dimiao',
              'Garcia Hernandez',
              'Guindulman',
              'Inabanga',
              'Jagna',
              'Loay',
              'Loon',
              'Mabini',
              'Maribojoc',
              'Panglao',
              'Pilar',
              'President Carlos P. Garcia',
              'San Isidro',
              'San Miguel',
              'Sevilla',
              'Sierra Bullones',
              'Tagbilaran',
              'Talibon',
              'Tubigon',
              'Ubay',
            ],
          },
          Cebu: {
            Cities: [
              'Cebu City',
              'Lapu-Lapu City',
              'Mandaue City',
              'Bacong',
              'Bogo City',
              'Carcar City',
              'Danao City',
              'Toledo City',
              'Naga City',
              'Talisay City',
              'Alcantara',
              'Alegria',
              'Aloguinsan',
              'Argao',
              'Asturias',
              'Badian',
              'Balamban',
              'Bantayan',
              'Barili',
              'Bogo',
              'Boljoon',
              'Borbon',
              'Carcar',
              'Carmen',
              'Catmon',
              'Compostela',
              'Consolacion',
              'Cordova',
              'Cortes',
              'Daanbantayan',
              'Dalaguete',
              'Danao',
              'Duero',
              'Ginatilan',
              'Liloan',
              'Lupog',
              'Madridejos',
              'Malabuyoc',
              'Mandaue',
              'Medellin',
              'Oslob',
              'Pinamungahan',
            ],
          },
          'Sequijor Island': {
            Cities: [
              'Siquijor',
              'Larena',
              'Lazi',
              'Maria',
              'San Juan',
              'Enrique Villanueva',
              'Santo Niño',
            ],
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
          'Negros Oriental': {
            Cities: [
              'Dumaguete City',
              'Bayawan City',
              'Canlaon City',
              'Bacong',
              'Amlan',
              'Ayungon',
              'Bindoy',
              'Dauin',
              'Jimalalud',
              'La Libertad',
              'Mabinay',
              'Manjuyod',
              'Pamplona',
              'San Jose',
              'Santa Catalina',
              'Siaton',
              'Tanjay City',
              'Valencia',
              'Zamboanguita',
            ],
          },
        }
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
              'Bago City',
              'Cadiz City',
              'Escalante City',
              'Himamaylan City',
              'Kabankalan City',
              'La Carlota City',
              'Sagay City',
              'San Carlos City',
              'Silay City',
              'Sipalay City',
              'Talisay City',
              'Victorias City'
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
    }
  }
};

export default countryData;
