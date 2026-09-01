import { apiRequest } from './config';

export const mockLawyers = [
  {
    id: 1,
    user_id: 6,
    name: "Adv. Rahim Karim",
    specialization: "Corporate",
    district: "Dhaka",
    bio: "Senior corporate and commercial lawyer specializing in contract compliance, cross-border M&A, and company registrations.",
    experience_years: 9,
    bar_license: "DBA-2019-00417",
    consultation_fee: 2500.00,
    rating: 4.9,
    reviews_count: 128,
    initials: "RK",
    services: [
      "Corporate Contract Drafting & Review",
      "Business Registration & Compliance",
      "Mergers & Acquisitions Advisory"
    ],
    reviews: [
      { name: "Sadia Anwar", rating: 5.0, comment: "Extremely thorough with our contract review — explained every clause clearly." },
      { name: "Mahin Hasan", rating: 4.8, comment: "Responsive and knowledgeable, resolved our registration issue in days." },
      { name: "Nusrat Tania", rating: 5.0, comment: "Booked an appointment same day and got clear, actionable advice." }
    ]
  },
  {
    id: 2,
    user_id: 7,
    name: "Adv. Farzana Yasmin",
    specialization: "Family",
    district: "Chattogram",
    bio: "Expert in family law, child custody mediation, inheritance disputes, and marital property settlements.",
    experience_years: 7,
    bar_license: "CBA-2021-00892",
    consultation_fee: 1800.00,
    rating: 4.8,
    reviews_count: 96,
    initials: "FY",
    services: [
      "Divorce & Marital Settlements",
      "Child Custody & Guardianship",
      "Family Property & Inheritance Division"
    ],
    reviews: [
      { name: "Tanvir Islam", rating: 5.0, comment: "Handled our sensitive family estate matter with tremendous empathy and tact." },
      { name: "Farhan Ahmed", rating: 4.6, comment: "Very professional consultation on legal guardianship procedures." }
    ]
  },
  {
    id: 3,
    user_id: 8,
    name: "Adv. Kamrul Hasan",
    specialization: "Criminal",
    district: "Sylhet",
    bio: "Dedicated defense attorney focusing on criminal litigation, bail applications, and high-profile appellate hearings.",
    experience_years: 12,
    bar_license: "SBA-2016-00129",
    consultation_fee: 3000.00,
    rating: 4.7,
    reviews_count: 142,
    initials: "KH",
    services: [
      "Criminal Defense Litigation",
      "High Court & District Court Bail",
      "Appellate Representation"
    ],
    reviews: [
      { name: "Jannatul Nayem", rating: 4.8, comment: "Secured bail promptly and guided us throughout the trial hearing." }
    ]
  },
  {
    id: 4,
    user_id: 9,
    name: "Adv. Nasrin Akter",
    specialization: "Property",
    district: "Khulna",
    bio: "Specialized in real estate title verification, deed registration, and land dispute settlements.",
    experience_years: 6,
    bar_license: "KBA-2022-00543",
    consultation_fee: 1500.00,
    rating: 4.9,
    reviews_count: 81,
    initials: "NA",
    services: [
      "Land Title & Deed Verification",
      "Property Inheritance Settlement",
      "Real Estate Dispute Mediation"
    ],
    reviews: [
      { name: "Sadia Anwar", rating: 5.0, comment: "Identified a serious defect in a property title before I signed the purchase contract." }
    ]
  },
  {
    id: 5,
    user_id: 10,
    name: "Adv. Shafiul Alam",
    specialization: "Tax",
    district: "Rajshahi",
    bio: "Certified tax consultant assisting corporations and individuals with NBR audits and tribunal appeals.",
    experience_years: 8,
    bar_license: "RBA-2020-00331",
    consultation_fee: 2000.00,
    rating: 4.6,
    reviews_count: 64,
    initials: "SA",
    services: [
      "Income Tax & NBR Filings",
      "VAT Assessment Appeals",
      "Corporate Tax Structuring"
    ],
    reviews: [
      { name: "Mahin Hasan", rating: 4.7, comment: "Clear and straightforward advice on complex corporate income tax filings." }
    ]
  },
  {
    id: 6,
    user_id: 11,
    name: "Adv. Tania Rahman",
    specialization: "Labor",
    district: "Dhaka",
    bio: "Advocate for employee rights, workplace regulations, industrial disputes, and severance disputes.",
    experience_years: 5,
    bar_license: "DBA-2023-00912",
    consultation_fee: 1400.00,
    rating: 4.8,
    reviews_count: 110,
    initials: "TR",
    services: [
      "Employment Contract Disputes",
      "Wrongful Termination Appeals",
      "Workplace Harassment & Safety Compliance"
    ],
    reviews: [
      { name: "Nusrat Tania", rating: 4.9, comment: "Helped our union reach an amicable settlement regarding workplace safety." }
    ]
  }
];

export const lawyersApi = {
  list: async (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    const res = await apiRequest(`/lawyers/read.php${query.toString() ? `?${query.toString()}` : ''}`, {
      method: 'GET',
    });

    if (res.success && Array.isArray(res.data) && res.data.length > 0) {
      return res;
    }
    // Return mockLawyers if API not yet populated or offline
    let list = [...mockLawyers];
    if (params.specialization && params.specialization !== 'All') {
      list = list.filter(l => l.specialization.toLowerCase() === params.specialization.toLowerCase());
    }
    if (params.district && params.district !== 'All') {
      list = list.filter(l => l.district.toLowerCase() === params.district.toLowerCase());
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      list = list.filter(l => l.name.toLowerCase().includes(q) || l.specialization.toLowerCase().includes(q) || l.district.toLowerCase().includes(q));
    }
    return { success: true, data: list, message: 'Retrieved lawyers list' };
  },

  getById: async (id) => {
    const res = await apiRequest(`/lawyers/read.php?id=${id}`, {
      method: 'GET',
    });
    if (res.success && res.data) {
      return res;
    }
    const found = mockLawyers.find(l => l.id === Number(id) || l.user_id === Number(id));
    return found 
      ? { success: true, data: found, message: 'Found lawyer' } 
      : { success: false, data: null, message: 'Lawyer not found' };
  }
};
