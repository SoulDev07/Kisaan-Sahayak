import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  ActivityIndicator, 
  ScrollView, 
  Alert, 
  Modal,
  Animated,
  FlatList,
  Linking,
  SafeAreaView,
  Image,
  ImageBackground,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { NetworkConfig } from '../utils/NetworkConfig';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import ViewShot from 'react-native-view-shot';
import MicOverlay from '../components/MicOverlay';
import schemesData from '../data/schemes.json';
import { useTheme } from '../context/ThemeContext';
import { StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const API_BASE = NetworkConfig.API_BASE;

// PM-KISAN official form image (static require for Expo bundler)
const PM_KISAN_IMG = require('../assets/schemes/pm_kisan.png');
const PM_KISAN_ASSET = Image.resolveAssetSource ? Image.resolveAssetSource(PM_KISAN_IMG) : { width: 714, height: 892 };
const PM_KISAN_ASPECT = PM_KISAN_ASSET.width / PM_KISAN_ASSET.height;

// Enhanced schemes data with more schemes
const ENHANCED_SCHEMES = [
  {
    id: 1,
    scheme_name: 'PM-KISAN',
    content: 'Direct income support of ₹6000 per year to farmers in three equal installments',
    scheme_type: 'central_government',
    metadata: {
      key_benefit: '₹6000/year',
      helpline_number: '155261',
      official_website: 'https://pmkisan.gov.in',
      ministry: 'Ministry of Agriculture & Farmers Welfare',
      launch_date: '2019',
      beneficiaries: '11+ crore farmers'
    },
    isTopSuggestion: true,
    suggestionReason: 'Most widely adopted scheme with direct benefit transfer, perfect for immediate financial support',
    whyEffective: [
      'Direct cash transfer to bank accounts - no middlemen',
      'Covers 11+ crore farmers across India',
      'Quick verification through Aadhaar linking',
      'Seasonal support during sowing periods'
    ],
    description: 'PM-KISAN provides direct income support to landholding farmer families across the country to supplement their financial needs for procuring various inputs related to agriculture and allied activities as well as domestic needs.',
    eligibility: [
      'Small and marginal farmers with cultivable land',
      'Valid Aadhaar card mandatory',
      'Bank account linked with Aadhaar',
      'Land ownership documents required'
    ],
    requiredDocuments: [
      'Aadhaar Card',
      'Bank Account Details', 
      'Land Records (Khata/Khatauni)',
      'Mobile Number'
    ]
  },
  {
    id: 2,
    scheme_name: 'PM Fasal Bima Yojana',
    content: 'Crop insurance with 2% premium for Kharif and 1.5% for Rabi crops',
    scheme_type: 'central_government',
    metadata: {
      key_benefit: 'Crop Insurance',
      helpline_number: '14447',
      official_website: 'https://pmfby.gov.in',
      ministry: 'Ministry of Agriculture & Farmers Welfare',
      launch_date: '2016',
      beneficiaries: '3+ crore farmers'
    },
    isTopSuggestion: false,
    suggestionReason: 'Essential protection against crop losses due to natural calamities',
    whyEffective: [
      'Low premium rates (2% Kharif, 1.5% Rabi)',
      'Comprehensive coverage for natural disasters',
      'Quick claim settlement process',
      'Covers yield and post-harvest losses'
    ],
    description: 'PMFBY provides comprehensive crop insurance coverage against natural calamities, pests, and diseases. It ensures financial stability for farmers during crop failures.',
    eligibility: [
      'All farmers growing notified crops',
      'Mandatory for loanee farmers',
      'Optional for non-loanee farmers',
      'Must apply within specified timeframe'
    ],
    requiredDocuments: [
      'Land Records',
      'Crop Declaration',
      'Bank Account Details',
      'Aadhaar Card'
    ]
  },
  {
    id: 3,
    scheme_name: 'Soil Health Card',
    content: 'Free soil testing and personalized recommendations for better crop yield',
    scheme_type: 'central_government',
    metadata: {
      key_benefit: 'Free Soil Testing',
      helpline_number: '011-23382305',
      official_website: 'https://soilhealth.dac.gov.in',
      ministry: 'Ministry of Agriculture & Farmers Welfare',
      launch_date: '2015',
      beneficiaries: 'All farmers'
    },
    isTopSuggestion: false,
    suggestionReason: 'Scientific approach to soil management for optimal crop production',
    whyEffective: [
      'Free soil testing every 3 years',
      'Personalized fertilizer recommendations',
      'Improves soil fertility and crop yield',
      'Reduces input costs'
    ],
    description: 'Soil Health Card scheme provides farmers with detailed information about soil nutrient status and recommendations for improving soil health and crop productivity.',
    eligibility: [
      'All farmers across India',
      'Land-owning and tenant farmers',
      'No income or land size restrictions'
    ],
    requiredDocuments: [
      'Aadhaar Card',
      'Land Records',
      'Recent Photograph'
    ]
  },
  {
    id: 4,
    scheme_name: 'PM Krishi Sinchayee Yojana',
    content: 'Subsidy for micro-irrigation systems and water conservation',
    scheme_type: 'central_government',
    metadata: {
      key_benefit: '60% Subsidy',
      helpline_number: '011-23382351',
      official_website: 'https://pmksy.gov.in',
      ministry: 'Ministry of Agriculture & Farmers Welfare',
      launch_date: '2015',
      beneficiaries: 'Lakhs of farmers'
    },
    isTopSuggestion: false,
    suggestionReason: 'Water conservation and efficient irrigation for sustainable farming',
    whyEffective: [
      '60% subsidy on micro-irrigation systems',
      'Reduces water consumption by 40-60%',
      'Increases crop yield by 20-30%',
      'Suitable for all crop types'
    ],
    description: 'PMKSY promotes efficient water use through micro-irrigation systems like drip and sprinkler irrigation, helping farmers conserve water and improve productivity.',
    eligibility: [
      'All farmers with irrigation facilities',
      'Land ownership or lease rights',
      'Assured source of irrigation'
    ],
    requiredDocuments: [
      'Land Records',
      'Irrigation Source Proof',
      'Bank Account Details',
      'Aadhaar Card'
    ]
  },
  {
    id: 5,
    scheme_name: 'MahaDBT Farmer Portal',
    content: 'Centralized online application platform for Maharashtra state schemes',
    scheme_type: 'state_government',
    metadata: {
      key_benefit: 'Single Window',
      helpline_number: '022-49150800',
      official_website: 'https://mahadbt.maharashtra.gov.in',
      ministry: 'Maharashtra Agriculture Department',
      launch_date: '2017',
      beneficiaries: 'Maharashtra farmers'
    },
    isTopSuggestion: false,
    suggestionReason: 'State-specific schemes with easy online application process',
    whyEffective: [
      'Single window for multiple schemes',
      'Direct Benefit Transfer (DBT)',
      'Real-time application tracking',
      'Aadhaar-based authentication'
    ],
    description: 'MahaDBT portal provides a centralized platform for Maharashtra farmers to apply for various state government schemes with streamlined processes and direct benefit transfers.',
    eligibility: [
      'Maharashtra residents',
      'Valid Aadhaar card',
      'Bank account linked with Aadhaar'
    ],
    requiredDocuments: [
      'Aadhaar Card',
      'Bank Account Details',
      'Land Records (7/12, 8-A)',
      'Recent Photograph'
    ]
  }
];

export default function DocumentAgentScreen({ navigation }) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = makeStyles(theme);
  // Loading states
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingStage, setLoadingStage] = useState('analyzing');
  const [loadingText, setLoadingText] = useState('Analyzing your farming activity...');
  const [showSchemes, setShowSchemes] = useState(false);
  
  // Selected scheme and modal states
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [showSchemeModal, setShowSchemeModal] = useState(false);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [showAllSchemes, setShowAllSchemes] = useState(false);
  
  // Application form states (extended structured form for PDF generation)
  const [formData, setFormData] = useState({
    // Legacy flat fields (kept for backward compatibility / PM-Kisan image overlay)
    farmer_name: '',
    father_name: '',
    mobile_number: '',
    aadhaar_number: '',
    bank_account: '',
    ifsc_code: '',
    village: '',
    district: '',
    state: 'Maharashtra',
    pin_code: '',
    land_area: '',
    crop_type: '',
    sowing_date: '',
    // New structured fields
    subDivision: 'North District',
    block: 'Model Town',
    farmersName: 'Vinayak Bhatia',
    sex: 'Male',
    fhName: 'Rajesh Bhatia',
    aadharId: '123456789012',
    ifscCode: 'SBIN0001234',
    bankAC: '987654321098765',
    mobile: '9876543210',
    dob: '15/08/1989',
    category: 'GEN',
    address: 'H.No. 123, Village Rampur, Near Post Office',
    selfDeclaration: {
      isInstitutionalFarmer: 'No',
      heldConstitutionalPost: 'No',
      isFormerMinister: 'No',
      isRetiredEmployee: 'No',
      hadIncomeTax: 'No',
      isProfessional: 'No',
    },
    landDetails: {
      khewatNo: '123/45',
      khasraNo: '678',
      areaHect: '1.5',
      ownership: 'Single',
    },
    applicantDeclaration: {
      sonOf: 'Rajesh Bhatia',
      residentOf: 'Rampur',
    },
    permissionDetails: {
      sonOf: 'Rajesh Bhatia',
      residentOf: 'Rampur',
      enclosedAadhar: true,
      enclosedBank: true,
    },
    officeUse: {
      applicationAccepted: 'Yes',
      reasonForRejection: '',
      verifiedByPS: 'Amit Singh',
      dateEntered: new Date().toLocaleDateString(),
      deoName: 'Sunita Sharma',
    },
    dateAndPlace: {
      date: new Date().toLocaleDateString(),
      place: 'Rampur'
    }
  });
  const [autoFillLoading, setAutoFillLoading] = useState(false);
  const [autoFillStage, setAutoFillStage] = useState(0);
  const [isFormAutoFilled, setIsFormAutoFilled] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [documentGenerated, setDocumentGenerated] = useState(false);
  const [showPmKisanPreview, setShowPmKisanPreview] = useState(false);
  const viewShotRef = useRef(null);

  // Farmer profile data
  const [farmerProfile, setFarmerProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState(null);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Loading simulation on component mount
  useEffect(() => {
    simulateInitialLoading();
    fetchFarmerProfile();
  }, []);

  // Fetch farmer profile for auto-filling
  const fetchFarmerProfile = async () => {
    setProfileLoading(true);
    setProfileError(null);
    try {
      // Using the correct farmer ID from the database
      const farmerId = 'f001';
      const response = await NetworkConfig.safeFetch(`/farmer/${farmerId}/profile`);
      const profile = await response.json();
      setFarmerProfile(profile);
      console.log('Successfully fetched farmer profile:', profile);
    } catch (error) {
      console.log('Could not fetch farmer profile, using default data:', error.message);
      setProfileError(error.message);
      setFarmerProfile({
        name: 'Vinayak Bhatia',
        phoneNumber: '9876543210',
        village: 'Karjat, Raigad',
        farmSize: '1.2 hectares'
      });
    } finally {
      setProfileLoading(false);
    }
  };

  const simulateInitialLoading = async () => {
    const loadingStages = [
      { stage: 'analyzing', text: 'Analyzing your farming activity...', duration: 2000 },
      { stage: 'matching', text: 'Finding best schemes for you...', duration: 1500 },
      { stage: 'validating', text: 'Validating eligibility criteria...', duration: 1500 },
      { stage: 'complete', text: 'Ready! Found perfect scheme match', duration: 800 }
    ];

    for (let i = 0; i < loadingStages.length; i++) {
      const { stage, text, duration } = loadingStages[i];
      setLoadingStage(stage);
      setLoadingText(text);
      await new Promise(resolve => setTimeout(resolve, duration));
    }

  setInitialLoading(false);
  setShowSchemes(true);
    
  // Animate scheme appearance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // temporary: use inline theme styles where needed to avoid creating extra stylesheet here

  // Helper: create character boxes for PDF
  const generateCharBoxes = (str, count) => {
    const chars = String(str || '').split('');
    let boxes = '';
    for (let i = 0; i < count; i++) {
      boxes += `<td class="char-box">${chars[i] || ''}</td>`;
    }
    return boxes;
  };

  // Helper: yes/no checkbox representation
  const generateYesNoBox = (value = '') => {
    const v = String(value).toLowerCase();
    const yesChecked = v === 'yes' ? '☑' : '☐';
    const noChecked = v === 'no' ? '☑' : '☐';
    return `<td class="checkbox-cell">${yesChecked} Yes</td><td class="checkbox-cell">${noChecked} <span class="no-label">No</span></td>`;
  };

  // Auto-fill form with farmer profile data and show input fields
  const handleApplyWithAI = () => {
    setShowSchemeModal(false);
    setShowApplicationForm(true);
    setAutoFillLoading(true);
    setAutoFillStage(0);
    
    simulateAutoFill();
  };

  // Generate and send PDF document after user input using provided HTML template
  const generateAndSendDocument = async () => {
    setShowConfirmation(true);
    try {
      const docHtml = `
      <html>
        <head>
          <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />
          <style>
            body { font-family: Arial, sans-serif; font-size: 12px; margin: 0; padding: 15px; color: #333; }
            .form-container { border: 2px solid #000; padding: 10px; }
            .header { text-align: center; font-size: 16px; font-weight: bold; margin-bottom: 15px; text-decoration: underline; }
            .section-title { font-weight: bold; font-size: 14px; margin-top: 15px; margin-bottom: 5px; background-color: #eee; padding: 4px; border: 1px solid #ccc; text-align: center;}
            table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
            td, th { padding: 4px; vertical-align: bottom; }
            .label { font-weight: bold; }
            .value { border-bottom: 1px dotted #000; text-align: center; }
            .full-width { width: 100%; }
            .char-box { border: 1px solid #000; width: 20px; height: 20px; text-align: center; font-size: 14px; }
            .declaration-text { text-align: justify; line-height: 1.6; }
            .signature-area { border-bottom: 1px dotted #000; height: 40px; }
            .checkbox-cell { text-align: right; }
            .bordered-table, .bordered-table td, .bordered-table th { border: 1px solid #000; }
          </style>
        </head>
        <body>
          <div class=\"form-container\">
            <div class=\"header\">Application Form</div>

            <table>
              <tr>
                <td class=\"label\">Sub Division:</td><td class=\"value\">${formData.subDivision}</td>
                <td class=\"label\">Block:</td><td class=\"value\">${formData.block}</td>
                <td class=\"label\">Village:</td><td class=\"value\">${formData.village}</td>
                <td class=\"label\">Farmer's Name:</td><td class=\"value\">${formData.farmersName}</td>
              </tr>
              <tr>
                <td class=\"label\">Sex:</td><td class=\"value\">${formData.sex}</td>
                <td class=\"label\">F/H Name:</td><td class=\"value\">${formData.fhName}</td>
                 <td class=\"label\">D.O.B:</td><td class=\"value\">${formData.dob}</td>
              </tr>
            </table>

            <table>
                <tr>
                    <td class=\"label\" style=\"width: 80px;\">AADHAR ID:</td>
                    ${generateCharBoxes(formData.aadharId, 12)}
                    <td style=\"width: 20px;\"></td>
                    <td class=\"label\" style=\"width: 70px;\">IFSC Code:</td>
                    ${generateCharBoxes(formData.ifscCode, 11)}
                </tr>
                 <tr>
                    <td class=\"label\" style=\"width: 80px;\">Bank A/C:</td>
                    ${generateCharBoxes(formData.bankAC, 16)}
                     <td style=\"width: 20px;\"></td>
                    <td class=\"label\" style=\"width: 70px;\">Mobile:</td>
                    ${generateCharBoxes(formData.mobile, 10)}
                </tr>
            </table>

             <table>
              <tr>
                <td class=\"label\">Category:</td><td class=\"value\">${formData.category}</td>
                <td class=\"label\">Address:</td><td class=\"value full-width\" colspan=\"3\">${formData.address}</td>
              </tr>
            </table>
            
            <div class=\"section-title\">Self Declaration:</div>
            <table class=\"bordered-table\">
                <tr><th></th><th style=\"width: 100px;\">Yes / No</th></tr>
                <tr><td>I am an institutional farmer</td> ${generateYesNoBox(formData.selfDeclaration.isInstitutionalFarmer)}</tr>
                <tr><td>Any family member ever held or holding a constitutional post</td>${generateYesNoBox(formData.selfDeclaration.heldConstitutionalPost)}</tr>
                <tr><td>Any family member ever held or holding the post of MLA/MP/Mayor/Chairman Zila Parishad</td>${generateYesNoBox(formData.selfDeclaration.isFormerMinister)}</tr>
                <tr><td>Any family member is/was serving or retired employees of central/state government (excluding class 4 employees)</td>${generateYesNoBox(formData.selfDeclaration.isRetiredEmployee)}</tr>
                <tr><td>Any family member has paid Income Tax for assessment year 2018-19</td>${generateYesNoBox(formData.selfDeclaration.hadIncomeTax)}</tr>
                <tr><td>Any family member is a registered Doctor/Lawyer/CA/Engineer/Architects practicing privately</td>${generateYesNoBox(formData.selfDeclaration.isProfessional)}</tr>
            </table>

            <div class=\"section-title\">Land Details</div>
            <table>
               <tr>
                <td class=\"label\">Khewat No.</td><td class=\"value\">${formData.landDetails.khewatNo}</td>
                <td class=\"label\">Khasra No.</td><td class=\"value\">${formData.landDetails.khasraNo}</td>
                 <td class=\"label\">Area (Hect.)</td><td class=\"value\">${formData.landDetails.areaHect}</td>
                <td class=\"label\">Ownership:</td><td class=\"value\">${formData.landDetails.ownership}</td>
              </tr>
            </table>
             <p style=\"font-size: 10px;\">(*More land details, if any, may be written on back page)</p>

            <div class=\"section-title\">Declaration by the applicant:</div>
            <p class=\"declaration-text\">
                I, <span class=\"value\">&nbsp;${formData.farmersName}&nbsp;</span> S/o <span class=\"value\">&nbsp;${formData.applicantDeclaration.sonOf}&nbsp;</span> R/o Village <span class=\"value\">&nbsp;${formData.applicantDeclaration.residentOf}&nbsp;</span> hereby declare that above information provided by me is true to my knowledge and if found incorrect, only I would be liable for the same. The total cultivable land of my family as defined in operational guidelines of (PM-Kisan) in the country is less than 2 hectares.
            </p>
            <table>
                <tr>
                    <td class=\"label\">Date & Place:</td><td class=\"value\">${formData.dateAndPlace.date}, ${formData.dateAndPlace.place}</td>
                    <td style=\"width: 40%;\"></td>
                    <td class=\"label\">Signature of Applicant.........................</td>
                </tr>
            </table>
            
             <div class=\"section-title\">Permission to Use AADHAR Number:</div>
             <p class=\"declaration-text\">
                I, <span class=\"value\">&nbsp;${formData.farmersName}&nbsp;</span> S/o <span class=\"value\">&nbsp;${formData.permissionDetails.sonOf}&nbsp;</span> R/o Village <span class=\"value\">&nbsp;${formData.permissionDetails.residentOf}&nbsp;</span> hereby grant my permission to use my AADHAR number for verification purpose under (PM-KISAN) scheme only.
             </p>
              <table>
                <tr>
                    <td>Enclosed: AADHAR Copy - Yes ${formData.permissionDetails.enclosedAadhar ? '☑' : '☐'} No ${!formData.permissionDetails.enclosedAadhar ? '☑' : '☐'}</td>
                    <td>Bank Details Copy: - Yes ${formData.permissionDetails.enclosedBank ? '☑' : '☐'} No ${!formData.permissionDetails.enclosedBank ? '☑' : '☐'}</td>
                </tr>
                 <tr>
                    <td class=\"label\">Date & Place:</td><td class=\"value\">${formData.dateAndPlace.date}, ${formData.dateAndPlace.place}</td>
                    <td style=\"width: 40%;\"></td>
                    <td class=\"label\">Signature of Applicant.........................</td>
                </tr>
            </table>

            <div class=\"section-title\">For Office Use</div>
             <table>
                <tr>
                    <td>Application Accepted: ${formData.officeUse.applicationAccepted}</td>
                    <td>If No, Reason for Rejection: <span class=\"value\">${formData.officeUse.reasonForRejection}</span></td>
                </tr>
                 <tr>
                    <td>Verified By PS......................</td>
                    <td>Signature...................</td>
                     <td>Date Entered: <span class=\"value\">${formData.officeUse.dateEntered}</span></td>
                </tr>
                 <tr>
                    <td>DEO Name: <span class=\"value\">${formData.officeUse.deoName}</span></td>
                    <td>Signatures.........................</td>
                </tr>
            </table>

          </div>
        </body>
      </html>
    `;

      if (Print && Print.printToFileAsync) {
        const { uri } = await Print.printToFileAsync({ html: docHtml });
        await sharePdfFile(uri);
        setShowConfirmation(false);
      } else {
        await shareToWhatsAppPlainText(docHtml);
        setShowConfirmation(false);
      }
    } catch (error) {
      console.error('Error generating structured PDF:', error);
      setShowConfirmation(false);
      Alert.alert('Error', 'Failed to generate document.');
    }
  };

  // Share helpers
  const shareToWhatsAppPlainText = async (htmlContent) => {
    // Convert HTML to simple text
    const text = htmlContent.replace(/<[^>]*>/g, '\n').replace(/\n\s+\n/g, '\n\n').trim();
    // Use WhatsApp URL scheme; fallback to web.whatsapp.com if not available
    const phone = formData.mobile_number || farmerProfile?.phoneNumber || '';
    const message = encodeURIComponent(text + '\n\n-- Shared via Kisan Sahayak');
    const whatsappUrl = `whatsapp://send?text=${message}`;
    const webUrl = `https://api.whatsapp.com/send?text=${message}`;

    try {
      const supported = await Linking.canOpenURL(whatsappUrl);
      if (supported) {
        await Linking.openURL(whatsappUrl);
      } else {
        await Linking.openURL(webUrl);
      }
    } catch (err) {
      console.error('Could not open WhatsApp:', err);
      Alert.alert(t('common.error', 'Error'), t('document.whatsapp_failed', 'Could not open WhatsApp on this device.'));
    }
  };

  const sharePdfFile = async (uri) => {
    try {
      if (Sharing && Sharing.shareAsync) {
        await Sharing.shareAsync(uri, { mimeType: 'application/pdf' });
      } else {
        // If expo-sharing not available, open the file URI
        await Linking.openURL(uri);
      }
    } catch (err) {
      console.error('Failed to share PDF:', err);
      Alert.alert(t('common.error', 'Error'), t('document.share_failed', 'Failed to share the PDF file.'));
    }
  };

  const captureAndSharePmKisan = async () => {
    try {
      if (!viewShotRef.current) return;
      const uri = await viewShotRef.current.capture();

      // Try WhatsApp direct share via scheme for images
      const message = encodeURIComponent('PM-KISAN Application Form');
      const supported = await Linking.canOpenURL('whatsapp://send');
      if (supported) {
        // Use generic share so media is included; WhatsApp respects system sheet
        if (Sharing && Sharing.shareAsync) {
          await Sharing.shareAsync(uri, { dialogTitle: 'Share PM-KISAN Form', mimeType: 'image/png' });
        } else {
          await Linking.openURL(uri);
        }
      } else {
        // Fallback to web WhatsApp cannot attach files; provide text and open image URL instead
        if (Sharing && Sharing.shareAsync) {
          await Sharing.shareAsync(uri, { dialogTitle: 'Share PM-KISAN Form', mimeType: 'image/png' });
        } else {
          await Linking.openURL(uri);
        }
      }
    } catch (e) {
      console.error('Failed to capture/share PM-KISAN form:', e);
      Alert.alert('Error', 'Failed to share the PM-KISAN form image.');
    }
  };

  const simulateAutoFill = async () => {
    // Order of fields for progressive auto-fill animation
    const paths = [
      'subDivision','block','village','farmersName','sex','fhName','aadharId','ifscCode','bankAC','mobile','dob','category','address','landDetails.khewatNo','landDetails.khasraNo','landDetails.areaHect','landDetails.ownership','dateAndPlace.date','dateAndPlace.place'
    ];
    for (let i = 0; i < paths.length; i++) {
      const p = paths[i];
      setFormData(prev => {
        const next = { ...prev };
        const assign = (path, value) => {
          const segs = path.split('.');
          let ref = next;
            for (let s = 0; s < segs.length - 1; s++) {
              ref[segs[s]] = { ...(ref[segs[s]] || {}) };
              ref = ref[segs[s]];
            }
          ref[segs[segs.length - 1]] = value;
        };
        switch (p) {
          case 'village': assign(p, farmerProfile?.village || 'Rampur'); break;
          case 'farmersName': assign(p, farmerProfile?.name || 'Vinayak Bhatia'); assign('farmer_name', farmerProfile?.name || 'Vinayak Bhatia'); break;
          case 'fhName': assign(p, 'Rajesh Bhatia'); assign('father_name','Rajesh Bhatia'); break;
          case 'aadharId': assign(p, '123456789012'); assign('aadhaar_number','1234-5678-9012'); break;
          case 'ifscCode': assign(p, 'SBIN0001234'); assign('ifsc_code','SBIN0001234'); break;
          case 'bankAC': assign(p, '987654321098765'); assign('bank_account','987654321098765'); break;
          case 'mobile': assign(p, farmerProfile?.phoneNumber || '9876543210'); assign('mobile_number', farmerProfile?.phoneNumber || '9876543210'); break;
          case 'landDetails.areaHect': assign(p, farmerProfile?.farmSize || '1.5'); assign('land_area', farmerProfile?.farmSize || '1.5'); break;
          case 'dateAndPlace.date': assign(p, new Date().toLocaleDateString()); break;
          default: // keep existing value
            break;
        }
        return next;
      });
      setAutoFillStage(i + 1);
      await new Promise(r => setTimeout(r, 120));
    }
    setAutoFillLoading(false);
    setIsFormAutoFilled(true);
  };

  // Handle form submission -> generate PDF directly with new structure
  const handleConfirmApplication = () => {
    const required = ['farmersName','fhName','aadharId','mobile','village','block','subDivision'];
    const missing = required.filter(k => !String(formData[k] || '').trim());
    if (missing.length) {
      Alert.alert('Missing Fields', `Please fill: ${missing.join(', ')}`);
      return;
    }
    generateAndSendDocument();
  };

  const toggleSelfDecl = (key) => {
    setFormData(prev => ({
      ...prev,
      selfDeclaration: {
        ...prev.selfDeclaration,
        [key]: prev.selfDeclaration[key] === 'Yes' ? 'No' : 'Yes'
      }
    }));
  };

  const togglePermission = (key) => {
    setFormData(prev => ({
      ...prev,
      permissionDetails: {
        ...prev.permissionDetails,
        [key]: !prev.permissionDetails[key]
      }
    }));
  };

  // Handle phone number click
  const handlePhoneClick = (phoneNumber) => {
    const cleanNumber = phoneNumber.replace(/[^0-9+]/g, '');
    Linking.openURL(`tel:${cleanNumber}`);
  };

  // Handle website link click
  const handleWebsiteClick = (url) => {
    Linking.openURL(url);
  };

  // Render scheme card
  const renderSchemeCard = (scheme, isTop = false) => (
    <View key={scheme.id} style={[styles.schemeCard, isTop && styles.topSchemeCard]}>
      {isTop && (
        <View style={styles.topSuggestionBadge}>
          <MaterialIcons name="star" size={16} color="#6366f1" />
          <Text style={styles.topSuggestionText}>{t('document.top_suggestion', 'TOP SUGGESTION')}</Text>
        </View>
      )}
      
      <View style={styles.schemeHeader}>
        <Text style={styles.schemeName}>{scheme.scheme_name}</Text>
        <View style={styles.schemeTypeTag}>
          <Text style={styles.schemeTypeText}>
            {scheme.scheme_type === 'central_government' ? t('document.scheme_type.central', 'Central') : t('document.scheme_type.state', 'State')}
          </Text>
        </View>
      </View>

      <Text style={styles.keyBenefit}>{scheme.metadata.key_benefit}</Text>
      <Text style={styles.schemeDescription}>{scheme.content}</Text>

      <View style={styles.schemeStats}>
        <View style={styles.statItem}>
          <MaterialIcons name="people" size={16} color="#6366f1" />
          <Text style={styles.statText}>{scheme.metadata.beneficiaries}</Text>
        </View>
        <View style={styles.statItem}>
          <MaterialIcons name="event" size={16} color="#6366f1" />
          <Text style={styles.statText}>{t('document.since', 'Since {{year}}', { year: scheme.metadata.launch_date })}</Text>
        </View>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.viewDetailsBtn}
          onPress={() => {
            setSelectedScheme(scheme);
            setShowSchemeModal(true);
          }}
        >
          <MaterialIcons name="info" size={16} color="#6366f1" />
          <Text style={styles.viewDetailsText}>{t('document.details', 'Details')}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.applyBtn, isTop && styles.topApplyBtn]}
          onPress={handleApplyWithAI}
        >
          <MaterialIcons name="psychology" size={16} color="#fff" />
          <Text style={styles.applyText}>{t('document.apply_with_ai', 'Apply with AI')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render loading screen
  if (initialLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <StatusBar barStyle={theme.colors.statusBarStyle} />
        <View style={[styles.header, { backgroundColor: theme.colors.headerBackground }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color={theme.colors.headerTint} />
          </TouchableOpacity>
          <Text style={[styles.headerText, { color: theme.colors.headerTitle }]}>{t('document.header', '🤖 Smart Document Assistant')}</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.loadingContainer}>
          <View style={[styles.loadingContent, { backgroundColor: theme.colors.background }]}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={[styles.loadingTitle, { color: theme.colors.text }]}>{t('document.loading_schemes', 'Loading Schemes')}</Text>
            <Text style={[styles.loadingSubtitle, { color: theme.colors.textSecondary }]}>{t('document.based_on_activity', 'Based on your activity')}</Text>
            <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>{loadingText}</Text>
            
            <View style={styles.loadingSteps}>
              <View style={[styles.loadingStep, loadingStage === 'analyzing' && styles.activeStep]}>
                <MaterialIcons name="analytics" size={20} color={loadingStage === 'analyzing' ? theme.colors.primary : theme.colors.textSecondary} />
                <Text style={[styles.stepText, loadingStage === 'analyzing' && styles.activeStepText, { color: loadingStage === 'analyzing' ? theme.colors.text : theme.colors.textSecondary }]}>{t('document.loading_stage.analyzing', 'Analyzing')}</Text>
              </View>
              <View style={[styles.loadingStep, loadingStage === 'matching' && styles.activeStep]}>
                <MaterialIcons name="search" size={20} color={loadingStage === 'matching' ? theme.colors.primary : theme.colors.textSecondary} />
                <Text style={[styles.stepText, loadingStage === 'matching' && styles.activeStepText, { color: loadingStage === 'matching' ? theme.colors.text : theme.colors.textSecondary }]}>{t('document.loading_stage.matching', 'Matching')}</Text>
              </View>
              <View style={[styles.loadingStep, loadingStage === 'validating' && styles.activeStep]}>
                <MaterialIcons name="verified" size={20} color={loadingStage === 'validating' ? theme.colors.primary : theme.colors.textSecondary} />
                <Text style={[styles.stepText, loadingStage === 'validating' && styles.activeStepText, { color: loadingStage === 'validating' ? theme.colors.text : theme.colors.textSecondary }]}>{t('document.loading_stage.validating', 'Validating')}</Text>
              </View>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Render main scheme display
  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={theme.colors.statusBarStyle} />
      <View style={[styles.header, { backgroundColor: theme.colors.headerBackground }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color={theme.colors.headerTint} />
        </TouchableOpacity>
  <Text style={[styles.headerText, { color: theme.colors.headerTitle }]}>{t('document.header', '🤖 Smart Document Assistant')}</Text>
        <TouchableOpacity onPress={() => {
          setInitialLoading(true);
          setShowSchemes(false);
          simulateInitialLoading();
        }}>
          <Ionicons name="refresh" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer}>
        {showSchemes && (
          <Animated.View 
            style={[
              styles.schemeContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            {/* Top Suggestion */}
            {renderSchemeCard(ENHANCED_SCHEMES[0], true)}

            {/* Profile Status Indicator */}
            {profileLoading && (
              <View style={styles.profileStatus}>
                <ActivityIndicator size="small" color="#6366f1" />
                <Text style={styles.profileStatusText}>{t('document.loading_profile', 'Loading your profile...')}</Text>
              </View>
            )}
            
            {profileError && (
              <View style={styles.profileStatus}>
                <MaterialIcons name="info" size={16} color="#6366f1" />
                <Text style={styles.profileStatusText}>{t('document.using_default_profile', 'Using default profile data')}</Text>
                <TouchableOpacity 
                  style={styles.retryButton}
                  onPress={fetchFarmerProfile}
                >
                  <MaterialIcons name="refresh" size={16} color="#6366f1" />
                </TouchableOpacity>
              </View>
            )}

            {/* View All Schemes Button */}
            <TouchableOpacity 
              style={styles.viewAllSchemesBtn}
              onPress={() => setShowAllSchemes(true)}
            >
              <MaterialIcons name="list" size={20} color="#6366f1" />
              <Text style={styles.viewAllSchemesText}>View All Available Schemes</Text>
              <MaterialIcons name="arrow-forward" size={20} color="#6366f1" />
            </TouchableOpacity>
          </Animated.View>
        )}
      </ScrollView>

      {/* All Schemes Modal */}
      <Modal
        visible={showAllSchemes}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAllSchemes(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: theme.colors.overlay }]}>
          <View style={[styles.allSchemesModalContent, { backgroundColor: theme.colors.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>All Available Schemes</Text>
              <TouchableOpacity onPress={() => setShowAllSchemes(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={ENHANCED_SCHEMES}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item, index }) => renderSchemeCard(item, index === 0)}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.schemesList}
            />
          </View>
        </View>
      </Modal>

      {/* Scheme Details Modal */}
      <Modal
        visible={showSchemeModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSchemeModal(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: theme.colors.overlay }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
              <TouchableOpacity 
                style={styles.applyWithAIBtn}
                onPress={handleApplyWithAI}
              >
                <MaterialIcons name="psychology" size={20} color="#fff" />
                <Text style={[styles.applyWithAIText, { color: theme.colors.headerTitle }]}>Apply with AI</Text>
              </TouchableOpacity>
              
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>{selectedScheme?.scheme_name}</Text>
              
              <TouchableOpacity onPress={() => setShowSchemeModal(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              <Text style={[styles.modalDescription, { color: theme.colors.textSecondary }]}>{selectedScheme?.description}</Text>
              
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Eligibility Criteria</Text>
                {selectedScheme?.eligibility.map((criteria, index) => (
                  <Text key={index} style={styles.detailItem}>• {criteria}</Text>
                ))}
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Required Documents</Text>
                {selectedScheme?.requiredDocuments.map((doc, index) => (
                  <Text key={index} style={styles.detailItem}>• {doc}</Text>
                ))}
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Contact Information</Text>
                <Text style={styles.contactInfo}>Ministry: {selectedScheme?.metadata.ministry}</Text>
                <TouchableOpacity onPress={() => handlePhoneClick(selectedScheme?.metadata.helpline_number)}>
                  <Text style={styles.clickableContactInfo}>
                    Helpline: {selectedScheme?.metadata.helpline_number}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleWebsiteClick(selectedScheme?.metadata.official_website)}>
                  <Text style={styles.clickableContactInfo}>
                    Website: {selectedScheme?.metadata.official_website}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Application Form Modal */}
      <Modal
        visible={showApplicationForm}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowApplicationForm(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: theme.colors.overlay }]}>
          <View style={[styles.formModalContent, { backgroundColor: theme.colors.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>PM-KISAN Application</Text>
              <TouchableOpacity onPress={() => setShowApplicationForm(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            {autoFillLoading && (
              <View style={styles.autoFillLoading}>
                <ActivityIndicator size="small" color="#10b981" />
                <Text style={styles.autoFillText}>
                  Autofilling with AI... ({autoFillStage}/19 fields completed)
                </Text>
              </View>
            )}

            {isFormAutoFilled && (
              <View style={styles.userInputSection}>
                <Text style={styles.userInputSectionTitle}>
                  📝 Please provide the following information:
                </Text>
                <Text style={styles.userInputSectionSubtitle}>
                  These fields are required to complete your application
                </Text>
              </View>
            )}

            <ScrollView style={styles.formBody}>
              {/* Personal Information */}
              <View style={styles.formSection}>
                <Text style={styles.formSectionTitle}>Personal Information</Text>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Farmer Name *</Text>
                  <TextInput style={[styles.input, formData.farmersName && styles.filledInput]}
                    value={formData.farmersName}
                    onChangeText={(text) => setFormData(prev => ({...prev, farmersName: text, farmer_name: text}))}
                    placeholder="Enter farmer name" placeholderTextColor="#666" />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Father / Husband Name *</Text>
                  <TextInput style={[styles.input, formData.fhName && styles.filledInput]}
                    value={formData.fhName}
                    onChangeText={(text) => setFormData(prev => ({...prev, fhName: text, father_name: text, applicantDeclaration: { ...prev.applicantDeclaration, sonOf: text }, permissionDetails: { ...prev.permissionDetails, sonOf: text }}))}
                    placeholder="Enter F/H name" placeholderTextColor="#666" />
                </View>
                <View style={styles.inputGroupRow}>
                  <View style={[styles.inputGroup, {flex:1, marginRight:8}]}> 
                    <Text style={styles.inputLabel}>Sex *</Text>
                    <TextInput style={[styles.input, formData.sex && styles.filledInput]}
                      value={formData.sex}
                      onChangeText={(text) => setFormData(prev => ({...prev, sex: text}))}
                      placeholder="Male/Female" placeholderTextColor="#666" />
                  </View>
                  <View style={[styles.inputGroup, {flex:1}]}> 
                    <Text style={styles.inputLabel}>D.O.B *</Text>
                    <TextInput style={[styles.input, formData.dob && styles.filledInput]}
                      value={formData.dob}
                      onChangeText={(text) => setFormData(prev => ({...prev, dob: text}))}
                      placeholder="DD/MM/YYYY" placeholderTextColor="#666" />
                  </View>
                </View>
                <View style={styles.inputGroupRow}>
                  <View style={[styles.inputGroup, {flex:1, marginRight:8}]}> 
                    <Text style={styles.inputLabel}>Category *</Text>
                    <TextInput style={[styles.input, formData.category && styles.filledInput]}
                      value={formData.category}
                      onChangeText={(text) => setFormData(prev => ({...prev, category: text.toUpperCase()}))}
                      placeholder="GEN/OBC/SC/ST" placeholderTextColor="#666" />
                  </View>
                  <View style={[styles.inputGroup, {flex:1}]}> 
                    <Text style={styles.inputLabel}>Mobile *</Text>
                    <TextInput style={[styles.input, formData.mobile && styles.filledInput]}
                      value={formData.mobile}
                      onChangeText={(text) => setFormData(prev => ({...prev, mobile: text, mobile_number: text}))}
                      placeholder="Enter mobile" placeholderTextColor="#666" keyboardType="phone-pad" />
                  </View>
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Aadhaar *</Text>
                  <TextInput style={[styles.input, formData.aadharId && styles.filledInput]}
                    value={formData.aadharId}
                    onChangeText={(text) => setFormData(prev => ({...prev, aadharId: text.replace(/[^0-9]/g,''), aadhaar_number: text}))}
                    placeholder="12 digit Aadhaar" placeholderTextColor="#666" keyboardType="numeric" />
                </View>
              </View>

              {/* Address / Location */}
              <View style={styles.formSection}>
                <Text style={styles.formSectionTitle}>Address / Location</Text>
                <View style={styles.inputGroupRow}>
                  <View style={[styles.inputGroup, {flex:1, marginRight:8}]}> 
                    <Text style={styles.inputLabel}>Sub Division *</Text>
                    <TextInput style={[styles.input, formData.subDivision && styles.filledInput]}
                      value={formData.subDivision}
                      onChangeText={(text) => setFormData(prev => ({...prev, subDivision: text}))}
                      placeholder="Enter sub division" placeholderTextColor="#666" />
                  </View>
                  <View style={[styles.inputGroup, {flex:1}]}> 
                    <Text style={styles.inputLabel}>Block *</Text>
                    <TextInput style={[styles.input, formData.block && styles.filledInput]}
                      value={formData.block}
                      onChangeText={(text) => setFormData(prev => ({...prev, block: text}))}
                      placeholder="Enter block" placeholderTextColor="#666" />
                  </View>
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Village *</Text>
                  <TextInput style={[styles.input, formData.village && styles.filledInput]}
                    value={formData.village}
                    onChangeText={(text) => setFormData(prev => ({...prev, village: text, applicantDeclaration: { ...prev.applicantDeclaration, residentOf: text }, permissionDetails: { ...prev.permissionDetails, residentOf: text }}))}
                    placeholder="Enter village" placeholderTextColor="#666" />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Full Address *</Text>
                  <TextInput style={[styles.input, formData.address && styles.filledInput]}
                    value={formData.address}
                    onChangeText={(text) => setFormData(prev => ({...prev, address: text}))}
                    placeholder="House / Landmark" placeholderTextColor="#666" />
                </View>
              </View>

              {/* Banking */}
              <View style={styles.formSection}>
                <Text style={styles.formSectionTitle}>Bank Details</Text>
                <View style={styles.inputGroupRow}>
                  <View style={[styles.inputGroup, {flex:1, marginRight:8}]}> 
                    <Text style={styles.inputLabel}>Bank A/C *</Text>
                    <TextInput style={[styles.input, formData.bankAC && styles.filledInput]}
                      value={formData.bankAC}
                      onChangeText={(text) => setFormData(prev => ({...prev, bankAC: text, bank_account: text}))}
                      placeholder="Account Number" placeholderTextColor="#666" />
                  </View>
                  <View style={[styles.inputGroup, {flex:1}]}> 
                    <Text style={styles.inputLabel}>IFSC *</Text>
                    <TextInput style={[styles.input, formData.ifscCode && styles.filledInput]}
                      value={formData.ifscCode}
                      onChangeText={(text) => setFormData(prev => ({...prev, ifscCode: text.toUpperCase(), ifsc_code: text.toUpperCase()}))}
                      placeholder="IFSC Code" placeholderTextColor="#666" autoCapitalize="characters" />
                  </View>
                </View>
              </View>

              {/* Land Details */}
              <View style={styles.formSection}>
                <Text style={styles.formSectionTitle}>Land Details</Text>
                <View style={styles.inputGroupRow}>
                  <View style={[styles.inputGroup, {flex:1, marginRight:8}]}> 
                    <Text style={styles.inputLabel}>Khewat No.</Text>
                    <TextInput style={[styles.input, formData.landDetails.khewatNo && styles.filledInput]}
                      value={formData.landDetails.khewatNo}
                      onChangeText={(text) => setFormData(prev => ({...prev, landDetails: { ...prev.landDetails, khewatNo: text }}))}
                      placeholder="Khewat" placeholderTextColor="#666" />
                  </View>
                  <View style={[styles.inputGroup, {flex:1}]}> 
                    <Text style={styles.inputLabel}>Khasra No.</Text>
                    <TextInput style={[styles.input, formData.landDetails.khasraNo && styles.filledInput]}
                      value={formData.landDetails.khasraNo}
                      onChangeText={(text) => setFormData(prev => ({...prev, landDetails: { ...prev.landDetails, khasraNo: text }}))}
                      placeholder="Khasra" placeholderTextColor="#666" />
                  </View>
                </View>
                <View style={styles.inputGroupRow}>
                  <View style={[styles.inputGroup, {flex:1, marginRight:8}]}> 
                    <Text style={styles.inputLabel}>Area (Hect.)</Text>
                    <TextInput style={[styles.input, formData.landDetails.areaHect && styles.filledInput]}
                      value={formData.landDetails.areaHect}
                      onChangeText={(text) => setFormData(prev => ({...prev, landDetails: { ...prev.landDetails, areaHect: text }, land_area: text }))}
                      placeholder="Area" placeholderTextColor="#666" />
                  </View>
                  <View style={[styles.inputGroup, {flex:1}]}> 
                    <Text style={styles.inputLabel}>Ownership</Text>
                    <TextInput style={[styles.input, formData.landDetails.ownership && styles.filledInput]}
                      value={formData.landDetails.ownership}
                      onChangeText={(text) => setFormData(prev => ({...prev, landDetails: { ...prev.landDetails, ownership: text }}))}
                      placeholder="Single / Joint" placeholderTextColor="#666" />
                  </View>
                </View>
              </View>

              {/* Self Declaration */}
              <View style={styles.formSection}>
                <Text style={styles.formSectionTitle}>Self Declaration (Tap to Toggle)</Text>
                {Object.entries(formData.selfDeclaration).map(([key,val]) => (
                  <TouchableOpacity key={key} style={styles.checkboxRow} onPress={() => toggleSelfDecl(key)}>
                    <MaterialIcons name={val === 'Yes' ? 'check-box' : 'check-box-outline-blank'} size={20} color={val === 'Yes' ? '#10b981' : '#666'} />
                    <Text style={styles.checkboxLabel}>{
                      {
                        isInstitutionalFarmer: 'I am an institutional farmer',
                        heldConstitutionalPost: 'Family member held/holding constitutional post',
                        isFormerMinister: 'Family member MLA/MP/Mayor/ZP Chair',
                        isRetiredEmployee: 'Family member serving/retired govt (excl class 4)',
                        hadIncomeTax: 'Family member paid Income Tax AY 2018-19',
                        isProfessional: 'Family member is registered professional (Doctor/Lawyer/CA etc)'
                      }[key]
                    }</Text>
                    <Text style={styles.checkboxValue}>{val}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Permissions & Attachments */}
              <View style={styles.formSection}>
                <Text style={styles.formSectionTitle}>Permissions & Attachments</Text>
                <TouchableOpacity style={styles.checkboxRow} onPress={() => togglePermission('enclosedAadhar')}>
                  <MaterialIcons name={formData.permissionDetails.enclosedAadhar ? 'check-box' : 'check-box-outline-blank'} size={20} color={formData.permissionDetails.enclosedAadhar ? '#10b981' : '#666'} />
                  <Text style={styles.checkboxLabel}>Enclosed Aadhaar Copy</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.checkboxRow} onPress={() => togglePermission('enclosedBank')}>
                  <MaterialIcons name={formData.permissionDetails.enclosedBank ? 'check-box' : 'check-box-outline-blank'} size={20} color={formData.permissionDetails.enclosedBank ? '#10b981' : '#666'} />
                  <Text style={styles.checkboxLabel}>Enclosed Bank Details Copy</Text>
                </TouchableOpacity>
                <View style={styles.inputGroupRow}>
                  <View style={[styles.inputGroup, {flex:1, marginRight:8}]}> 
                    <Text style={styles.inputLabel}>Date</Text>
                    <TextInput style={[styles.input, formData.dateAndPlace.date && styles.filledInput]}
                      value={formData.dateAndPlace.date}
                      onChangeText={(text) => setFormData(prev => ({...prev, dateAndPlace: { ...prev.dateAndPlace, date: text }}))}
                      placeholder="Date" placeholderTextColor="#666" />
                  </View>
                  <View style={[styles.inputGroup, {flex:1}]}> 
                    <Text style={styles.inputLabel}>Place</Text>
                    <TextInput style={[styles.input, formData.dateAndPlace.place && styles.filledInput]}
                      value={formData.dateAndPlace.place}
                      onChangeText={(text) => setFormData(prev => ({...prev, dateAndPlace: { ...prev.dateAndPlace, place: text }}))}
                      placeholder="Place" placeholderTextColor="#666" />
                  </View>
                </View>
              </View>

              {isFormAutoFilled && (
                <View style={styles.confirmSection}>
                  <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirmApplication}>
                    <MaterialIcons name="check-circle" size={20} color="#fff" />
                    <Text style={styles.confirmBtnText}>Confirm & Generate Document</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Confirmation Modal */}
      <Modal
        visible={showConfirmation}
        transparent={true}
        animationType="fade"
      >
        <View style={[styles.confirmationOverlay, { backgroundColor: theme.colors.overlay }]}>
                  <View style={[styles.confirmationContent, { backgroundColor: theme.colors.background, borderColor: theme.colors.primary }]}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.confirmationTitle, { color: theme.colors.primary }]}>Generating Document...</Text>
          <Text style={[styles.confirmationText, { color: theme.colors.textSecondary }]}>
            Creating your PM-KISAN application and sending to WhatsApp
          </Text>
        </View>
        </View>
      </Modal>

      {/* PM-KISAN Image Preview & Share Modal */}
      <Modal
        visible={showPmKisanPreview}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPmKisanPreview(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: theme.colors.overlay }]}>
          <View style={[styles.pmPreviewCard, { backgroundColor: theme.colors.background }]}>
            <View style={styles.pmHeaderRow}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>PM-KISAN Form Preview</Text>
              <TouchableOpacity onPress={() => setShowPmKisanPreview(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 12 }}>
              <ViewShot
                ref={viewShotRef}
                options={{ format: 'png', quality: 1, result: 'tmpfile' }}
                style={{ backgroundColor: '#fff', borderRadius: 8 }}
              >
                <View style={styles.pmFormContainer}>
                  <ImageBackground
                    source={PM_KISAN_IMG}
                    style={{ width: '100%', aspectRatio: PM_KISAN_ASPECT }}
                    resizeMode="contain"
                  >
                    {/* Overlayed text fields — positions are approximate percentages */}
                    {/* Header line: Village and Farmer's Name */}
                    <Text style={[styles.pmText, { top: '3.5%', left: '34%' }]}>{formData.village || farmerProfile?.village || ''}</Text>
                    <Text style={[styles.pmText, { top: '3.5%', left: '66%' }]}>{formData.farmer_name || farmerProfile?.name || ''}</Text>

                    {/* Aadhaar, IFSC, Bank A/c, Mobile */}
                    <Text style={[styles.pmText, { top: '10%', left: '14%' }]}>{formData.aadhaar_number || ''}</Text>
                    <Text style={[styles.pmText, { top: '10%', left: '50%' }]}>{formData.ifsc_code || ''}</Text>
                    <Text style={[styles.pmText, { top: '12.5%', left: '14%' }]}>{formData.bank_account || ''}</Text>
                    <Text style={[styles.pmText, { top: '12.5%', left: '50%' }]}>{formData.mobile_number || ''}</Text>

                    {/* Address (combine) */}
                    <Text style={[styles.pmText, { top: '15%', left: '22%' }]}>{`${formData.village || ''}, ${formData.district || ''}, ${formData.state || ''} - ${formData.pin_code || ''}`}</Text>

                    {/* Land Details: Area */}
                    <Text style={[styles.pmText, { top: '48%', left: '20%' }]}>{formData.land_area || ''}</Text>

                    {/* Declaration Name, Village, Date, Signature placeholder */}
                    <Text style={[styles.pmText, { top: '62%', left: '6%' }]}>{formData.farmer_name || farmerProfile?.name || ''}</Text>
                    <Text style={[styles.pmText, { top: '62%', left: '36%' }]}>{formData.village || ''}</Text>
                    <Text style={[styles.pmText, { top: '70%', left: '10%' }]}>{new Date().toLocaleDateString()}</Text>
                    <Text style={[styles.pmText, { top: '70%', left: '58%' }]}>{formData.farmer_name || farmerProfile?.name || ''}</Text>

                    {/* Permission to use AADHAR: Enclosed checkboxes text hint */}
                    <Text style={[styles.pmSmallText, { top: '77%', left: '22%' }]}>Aadhaar Copy: Yes</Text>
                    <Text style={[styles.pmSmallText, { top: '77%', left: '55%' }]}>Bank Details Copy: Yes</Text>
                  </ImageBackground>
                </View>
              </ViewShot>
            </ScrollView>

            <View style={styles.pmActionsRow}>
              <TouchableOpacity style={[styles.pmActionBtn, { backgroundColor: theme.colors.primary }]} onPress={async () => await captureAndSharePmKisan()}>
                <MaterialIcons name="share" size={18} color="#fff" />
                <Text style={styles.pmActionText}>Share via WhatsApp</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.pmActionBtn, { backgroundColor: '#2a2a2a' }]} onPress={() => setShowPmKisanPreview(false)}>
                <MaterialIcons name="close" size={18} color="#10b981" />
                <Text style={[styles.pmActionText, { color: '#10b981' }]}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Mic Overlay */}
      <MicOverlay 
        onPress={() => navigation.navigate('LiveVoiceScreen')}
        isVisible={true}
        isActive={false}
      />
    </SafeAreaView>
  );
}

const makeStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    justifyContent: 'space-between',
    shadowColor: theme.colors.shadow || '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  headerText: {
    color: theme.colors.headerTitle || theme.colors.text,
    fontWeight: '600',
    fontSize: 18,
  },
  backButton: {
    padding: 4,
  },
  headerSpacer: {
    width: 28,
  },
  scrollContainer: {
    flex: 1,
  },
  
  // Loading Screen
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingContent: {
    alignItems: 'center',
    maxWidth: 300,
  },
  loadingTitle: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 8,
  },
  loadingSubtitle: {
    color: theme.colors.primary,
    fontSize: 16,
    marginBottom: 20,
  },
  loadingText: {
    color: theme.colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
  },
  loadingSteps: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  loadingStep: {
    alignItems: 'center',
    opacity: 0.5,
  },
  activeStep: {
    opacity: 1,
  },
  stepText: {
    color: '#6b7280',
    fontSize: 12,
    marginTop: 4,
  },
  activeStepText: {
    color: '#10b981',
    fontWeight: '600',
  },

  // Main Scheme Display
  schemeContainer: {
    margin: 16,
  },
  topSuggestionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  topSuggestionText: {
    color: theme.colors.onPrimary || '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  schemeCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 16,
    shadowColor: theme.colors.shadow || '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  topSchemeCard: {
    borderWidth: 2,
    borderColor: '#10b981',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  schemeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  schemeName: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
  },
  schemeTypeTag: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  schemeTypeText: {
    color: '#10b981',
    fontSize: 12,
    fontWeight: '600',
  },
  keyBenefit: {
    color: theme.colors.onPrimary || '#fff',
    fontSize: 18,
    fontWeight: '600',
    backgroundColor: theme.colors.primary,
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
  },
  schemeDescription: {
    color: '#9ca3af',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  schemeStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: theme.colors.card,
    borderRadius: 8,
    paddingVertical: 12,
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statText: {
    color: '#9ca3af',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  viewDetailsBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  viewDetailsText: {
    color: '#10b981',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  applyBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981',
    borderRadius: 8,
    paddingVertical: 12,
  },
  topApplyBtn: {
    backgroundColor: '#10b981',
  },
  applyText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  viewAllSchemesBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: 8,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderStyle: 'dashed',
  },
  viewAllSchemesText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 12,
  },
  profileStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  profileStatusText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  retryButton: {
    padding: 4,
    marginLeft: 8,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: (theme.colors.overlay || 'rgba(0,0,0,0.6)'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    margin: 20,
    maxHeight: '80%',
    width: '90%',
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: theme.colors.shadow || '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  allSchemesModalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    margin: 20,
    maxHeight: '90%',
    width: '95%',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  formModalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    margin: 20,
    maxHeight: '90%',
    width: '95%',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  applyWithAIBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  applyWithAIText: {
    color: theme.colors.onPrimary || '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  modalTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  modalBody: {
    padding: 20,
  },
  schemesList: {
    padding: 20,
  },
  modalDescription: {
    color: '#9ca3af',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
  detailSection: {
    marginBottom: 24,
  },
  detailSectionTitle: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  detailItem: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 6,
  },
  contactInfo: {
    color: '#9ca3af',
    fontSize: 14,
    marginBottom: 6,
  },
  clickableContactInfo: {
    color: theme.colors.primary,
    fontSize: 14,
    marginBottom: 6,
    textDecorationLine: 'underline',
  },

  // User Input Section Styles
  userInputSection: {
    backgroundColor: (theme.colors.primary + '10') || '#10b98110',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  userInputSectionTitle: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  userInputSectionSubtitle: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },

  // Form Styles
  autoFillLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: (theme.colors.primary + '20') || '#10b98120',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  autoFillText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  formBody: {
    maxHeight: 500,
  },
  formSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  formSectionTitle: {
    color: '#10b981',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputGroupRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f1f1f',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#2a2a2a'
  },
  checkboxLabel: {
    flex: 1,
    color: '#ddd',
    marginLeft: 12,
    fontSize: 13,
  },
  checkboxValue: {
    color: '#10b981',
    fontWeight: '600',
    fontSize: 12,
    marginLeft: 8,
  },
  inputLabel: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  userInputLabel: {
    color: '#10b981',
  },
  input: {
    backgroundColor: theme.colors.card,
    color: theme.colors.text,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    fontSize: 16,
  },
  filledInput: {
    borderColor: '#10b981',
    backgroundColor: '#10b98110',
  },
  userInput: {
    borderColor: '#10b981',
    backgroundColor: '#10b98110',
  },
  confirmSection: {
    padding: 20,
    alignItems: 'center',
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  confirmBtnText: {
    color: theme.colors.onPrimary || '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },

  // Confirmation Modal
  confirmationOverlay: {
    flex: 1,
    backgroundColor: (theme.colors.overlay || 'rgba(0,0,0,0.9)'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmationContent: {
    backgroundColor: theme.colors.background,
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  confirmationTitle: {
    color: theme.colors.primary,
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  confirmationText: {
    color: theme.colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  // PM-KISAN preview styles
  pmPreviewCard: {
    width: '95%',
    maxHeight: '90%',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  pmHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  pmFormContainer: {
    padding: 12,
  },
  pmText: {
    position: 'absolute',
    fontSize: 10,
    color: '#000',
  },
  pmSmallText: {
    position: 'absolute',
    fontSize: 8,
    color: '#000',
  },
  pmActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    padding: 12,
  },
  pmActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  pmActionText: {
    color: '#fff',
    fontWeight: '600',
  },
});