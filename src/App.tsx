import React, { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Palette, 
  Layout, 
  Type, 
  Copy, 
  Check,
  RotateCcw,
  Code,
  ShieldCheck,
  User,
  Star,
  ShoppingBag,
  Info,
  ChevronDown,
  Monitor,
  Wand2,
  AlertTriangle,
  X,
  Settings,
  Shield,
  Store,
  Minus,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Sun,
  Moon,
  Image as ImageIcon,
  FileText,
  FolderOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { HexColorPicker } from "react-colorful";
import { Toaster, toast } from 'sonner';

import RichTextEditor from './RichTextEditor';

interface CustomAsset {
  id: string;
  url: string;
  x: number;
  y: number;
  width: number;
}

interface Pet {
  name: string;
  image: string;
  species?: string;
  age?: string;
  lvl?: string;
}

type EditorTheme = 'classic' | 'matrix' | 'sunset' | 'forest' | 'midnight';

interface LookupConfig {
  bgColor: string;
  bgImage: string;
  bgAttachment: 'scroll' | 'fixed';
  bgPosition: string;
  bgRepeat: string;
  bgSize: string;
  moduleHeaderBg: string;
  moduleHeaderText: string;
  moduleBorder: string;
  moduleBorderSize: number;
  moduleContentBg: string;
  textColor: string;
  linkColor: string;
  fontFamily: string;
  headerFont: string;
  moduleFont: string;
  moduleFontSize: number;
  fontSize: number;
  headerFontSize: number;
  headerTextColor: string;
  hideHeader: boolean;
  hideFooter: boolean;
  hideTrophies: boolean;
  hideCollections: boolean;
  hideShop: boolean;
  hideNCMall: boolean;
  hidePetCarousel: boolean;
  hideULText: boolean;
  hideEvents: boolean;
  hideNeohome: boolean;
  petDisplay: 'carousel' | 'grid';
  petGridCols: number;
  previewPetCount: number;
  petBorderRadius: number;
  petBorderSize: number;
  petBorderColor: string;
  petHoverScale: number;
  petImageSize: number;
  statsIconStyle: 'default' | 'circles' | 'bars' | 'hidden';
  collapsibleTrophies: boolean;
  imageBorderRadius: number;
  imagePadding: number;
  imageBorderSize: number;
  imageBgColor: string;
  moduleBorderRadius: number;
  moduleOpacity: number;
  hideModuleHeaders: boolean;
  modulePadding: number;
  customLinks: { label: string; url: string }[];
  cursor: string;
  mainWidth: number;
  mainMarginLeft: number;
  mainMarginTop: number;
  hideDefaultElements: boolean;
  hidePetDetails: boolean;
  matchTrophyBg: boolean;
  blendIcons: boolean;
  username: string;
  aboutMe: string;
  bioSections: { id: string; title: string; content: string }[];
  bioLayout: 'stacked' | 'side-by-side' | 'grid';
  userGenderColor: string;
  petGenderColor: string;
  shieldUrl: string;
  shopkeeperUrl: string;
  galleryKeeperUrl: string;
  neohomeUrl: string;
  customAssets: CustomAsset[];
  pets: Pet[];
  replaceNavbar: boolean;
  customNavbarHtml: string;
  customCss: string;
  positions: Record<string, {x: number, y: number}>;
}

const PET_IMAGES = [
  "https://pets.neopets.com/cp/n2jmxj4f/1/5.png", // Baby Aisha
  "https://pets.neopets.com/cp/oogcnsmk/1/5.png", // Mutant Draik
  "https://pets.neopets.com/cp/vwsv4k3g/1/5.png", // Faerie Xweetok
  "https://pets.neopets.com/cp/3tshdjvx/1/5.png", // Pirate Krawk
  "https://pets.neopets.com/cp/zsm9s6k4/1/5.png"  // Plushie Cybunny
];

const EDITOR_THEMES: Record<EditorTheme, { label: string; bg: string; text: string; accent: string; border: string; secondary: string }> = {
  classic: { 
    label: "Studio (Light)", 
    bg: "bg-white/80 backdrop-blur-2xl", 
    text: "text-slate-900", 
    accent: "bg-red-800", 
    border: "border-stone-200/50",
    secondary: "bg-white/50"
  },
  midnight: { 
    label: "Starry Night", 
    bg: "bg-[#0a0a0f]/80 backdrop-blur-2xl", 
    text: "text-indigo-100", 
    accent: "bg-indigo-600", 
    border: "border-indigo-900/40",
    secondary: "bg-indigo-950/20"
  },
  matrix: { 
    label: "Neo-Terminal", 
    bg: "bg-[#020502]/80 backdrop-blur-2xl", 
    text: "text-emerald-400", 
    accent: "bg-emerald-900", 
    border: "border-emerald-900/40",
    secondary: "bg-emerald-950/30"
  },
  sunset: { 
    label: "Crimson", 
    bg: "bg-[#110505]/80 backdrop-blur-2xl", 
    text: "text-red-100", 
    accent: "bg-red-900", 
    border: "border-red-900/30",
    secondary: "bg-red-950/40"
  },
  forest: { 
    label: "Parchment", 
    bg: "bg-[#fdfbf3]/80 backdrop-blur-2xl", 
    text: "text-stone-800", 
    accent: "bg-stone-700", 
    border: "border-stone-300/50",
    secondary: "bg-white/50"
  }
};

const hexToRgba = (hex: string, alpha: number) => {
  if (!hex || !hex.startsWith('#')) return hex;
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex.slice(1, 3), 16);
    g = parseInt(hex.slice(3, 5), 16);
    b = parseInt(hex.slice(5, 7), 16);
  } else {
    return hex;
  }
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const parseProfileHtml = (html: string) => {
  const data: Partial<LookupConfig> = {};
  
  // Extract Username
  const userMatch = html.match(/User Lookup: <b>([^<]*)<\/b>/i) || 
                   html.match(/Welcome, <a [^>]*>([^<]*)<\/a>/i);
  if (userMatch) data.username = userMatch[1].trim();

  // Extract About Me / Bio
  // Look for content in common bio containers or just after some known markers
  const bioMatch = html.match(/<div[^>]*id="userabout"[^>]*>(.*?)<\/div>/is) ||
                  html.match(/<td[^>]*class="content"[^>]*>(.*?)<table/is);
                  
  if (bioMatch) {
    let bio = bioMatch[1].trim();
    // Clean up if it looks like it captured half the page
    if (bio.length > 5000) bio = bio.substring(0, 5000);
    // Remove scripts if any (safeguard)
    bio = bio.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
    data.aboutMe = '';
    data.bioSections = [{
      id: 'imported-bio',
      title: 'Imported Bio',
      content: bio
    }];
  }

  // Extract Gender & Set Colors
  const genderMatch = html.match(/<b>Gender:<\/b>\s*<b[^>]*>([^<]+)<\/b>/i) ||
                     html.match(/<b>Gender:<\/b>\s*([^<]+)/i);
  if (genderMatch) {
    const g = genderMatch[1].trim();
    if (g.toLowerCase().includes('male')) data.userGenderColor = '#0000ff';
    if (g.toLowerCase().includes('female')) data.userGenderColor = '#ff66b2';
  }

  // Extract User Shield
  const shieldMatch = html.match(/src="([^"]*images\.neopets\.com\/images\/shields\/[^"]+)"/i);
  if (shieldMatch) {
    let url = shieldMatch[1];
    if (url.startsWith('//')) url = 'https:' + url;
    data.shieldUrl = url;
  }

  // Extract Pets
  const pets: Pet[] = [];
  // Pattern matches the li structure in the user's provided source
  const petBlockRegex = /<li>.*?<a href="\/petlookup\.phtml\?pet=([^"]+)".*?src="([^"]+)".*?<b>\1<\/b><br>\s*(?:<b[^>]*>[^<]+<\/b>\s*)?([^<]*?)<br>\s*<b>Age:<\/b>\s*([^<]+)<br><b>Level:<\/b>\s*([^<]+)/gis;
  
  let match;
  while ((match = petBlockRegex.exec(html)) !== null && pets.length < 12) {
    let imgUrl = match[2];
    if (imgUrl.startsWith('//')) imgUrl = 'https:' + imgUrl;
    
    pets.push({
      name: match[1].trim(),
      image: imgUrl,
      species: match[3].trim().replace(/\s+/g, ' '),
      age: match[4].trim(),
      lvl: match[5].trim()
    });
  }

  if (pets.length > 0) {
    data.pets = pets;
    data.previewPetCount = pets.length;
  }

  return data;
};

const parseGeneratedCode = (code: string): Partial<LookupConfig> => {
  const data: Partial<LookupConfig> = {};
  
  // Extract background colors
  const bgColorMatch = code.match(/body\s*{\s*background-color:\s*(#[a-fA-F0-9]{3,6}|rgba?\(.*?\))\s*!important;/i);
  if (bgColorMatch) data.bgColor = bgColorMatch[1];
  
  const bgImageMatch = code.match(/background(?:-image)?:\s*[^"']*url\("([^"]+)"\)/i);
  if (bgImageMatch) data.bgImage = bgImageMatch[1];

  const bgAttachmentMatch = code.match(/background-attachment:\s*([^!]+?)\s*!important/i);
  if (bgAttachmentMatch) data.bgAttachment = bgAttachmentMatch[1].trim() as any;

  const bgPositionMatch = code.match(/background-position:\s*([^!]+?)\s*!important/i);
  if (bgPositionMatch) data.bgPosition = bgPositionMatch[1].trim();

  const bgRepeatMatch = code.match(/background-repeat:\s*([^!]+?)\s*!important/i);
  if (bgRepeatMatch) data.bgRepeat = bgRepeatMatch[1].trim();

  const bgSizeMatch = code.match(/background-size:\s*([^!]+?)\s*!important/i);
  if (bgSizeMatch) data.bgSize = bgSizeMatch[1].trim();

  const textColorMatch = code.match(/body\s*{\s*[^}]*?color:\s*(#[a-fA-F0-9]{3,6}|rgba?\(.*?\))\s*!important;/i);
  if (textColorMatch) data.textColor = textColorMatch[1];

  const linkColorMatch = code.match(/a:link,\s*a:visited\s*{\s*color:\s*(#[a-fA-F0-9]{3,6}|rgba?\(.*?\))\s*!important;/i);
  if (linkColorMatch) data.linkColor = linkColorMatch[1];

  const headerBgMatch = code.match(/\.contentModuleHeader,\s*\.contentModuleHeaderAlt\s*{\s*background-color:\s*(#[a-fA-F0-9]{3,6}|rgba?\(.*?\))\s*!important/i);
  if (headerBgMatch) data.moduleHeaderBg = headerBgMatch[1];

  const headerColorMatch = code.match(/\.contentModuleHeader,\s*\.contentModuleHeaderAlt\s*{\s*[^}]*?color:\s*(#[a-fA-F0-9]{3,6}|rgba?\(.*?\))\s*!important/i);
  if (headerColorMatch) data.moduleHeaderText = headerColorMatch[1];

  const contentBgMatch = code.match(/\.contentModule,\s*\.contentModuleTable\s*{\s*background-color:\s*(#[a-fA-F0-9]{3,6}|rgba?\(.*?\))\s*!important/i);
  if (contentBgMatch) data.moduleContentBg = contentBgMatch[1];

  const borderMatch = code.match(/\.contentModule,\s*\.contentModuleTable\s*{\s*[^}]*?border:\s*(\d+)px\s*solid\s*(#[a-fA-F0-9]{3,6}|rgba?\(.*?\))\s*!important/i);
  if (borderMatch) {
    data.moduleBorderSize = parseInt(borderMatch[1]);
    data.moduleBorder = borderMatch[2];
  }

  const borderRadiusMatch = code.match(/border-radius:\s*(\d+)px\s*!important/i);
  if (borderRadiusMatch) data.moduleBorderRadius = parseInt(borderRadiusMatch[1]);

  const modulePaddingMatch = code.match(/\.contentModuleContent\s*{\s*padding:\s*(\d+)px\s*!important/i);
  if (modulePaddingMatch) data.modulePadding = parseInt(modulePaddingMatch[1]);

  const mainWidthMatch = code.match(/#content,\s*#main\s*{\s*[^}]*?width:\s*(\d+)px\s*!important/i);
  if (mainWidthMatch) data.mainWidth = parseInt(mainWidthMatch[1]);

  const marginTopMatch = code.match(/#content,\s*#main\s*{\s*margin:\s*(\d+)px\s+auto/i);
  if (marginTopMatch) data.mainMarginTop = parseInt(marginTopMatch[1]);

  const customCssMatch = code.match(/\/\*\s*Custom User CSS\s*\*\/\n([\s\S]*?)(?=\n<\/style>)/i);
  if (customCssMatch) data.customCss = customCssMatch[1].trim();

  // Extract relative positions
  const positions: Record<string, {x: number, y: number}> = {};
  const posRegex = /#(userinfo|usercollections|usershop|userneohome|userneopets|usertrophies|ncmall)\s*{\s*position:\s*relative\s*!important;\s*left:\s*(-?\d+)px\s*!important;\s*top:\s*(-?\d+)px\s*!important;/gi;
  let posMatch;
  while ((posMatch = posRegex.exec(code)) !== null) {
     positions[posMatch[1]] = { x: parseInt(posMatch[2]), y: parseInt(posMatch[3]) };
  }
  if (Object.keys(positions).length > 0) data.positions = positions;

  return data;
};

const TEMPLATES: (Partial<LookupConfig> & { name: string })[] = [
  {
    name: "Classic Neopian",
    bgColor: "#ffffff",
    bgImage: "",
    bgAttachment: "scroll",
    moduleHeaderBg: "#822E2E",
    moduleHeaderText: "#ffffff",
    moduleBorder: "#E4E4E4",
    moduleBorderSize: 1,
    moduleContentBg: "#ffffff",
    textColor: "#000000",
    linkColor: "#000099",
    moduleBorderRadius: 0,
    modulePadding: 5,
    petBorderRadius: 0,
    petHoverScale: 1,
    mainWidth: 800,
    fontFamily: "Verdana, sans-serif",
    hideHeader: false,
    hideEvents: false,
    hideNeohome: false,
    petDisplay: "carousel",
    bioLayout: "stacked",
    hideModuleHeaders: false,
    moduleOpacity: 100,
  },
  {
    name: "Faerie Ethereal",
    bgColor: "#eef5fc",
    bgImage: "https://images.neopets.com/backgrounds/cloud_background.gif",
    bgAttachment: "fixed",
    moduleHeaderBg: "#ffcce6",
    moduleHeaderText: "#6c5b7b",
    moduleBorder: "#b3d4ff",
    moduleBorderSize: 2,
    moduleContentBg: "rgba(255, 255, 255, 0.9)",
    textColor: "#566a80",
    linkColor: "#ff99cc",
    moduleBorderRadius: 10,
    moduleOpacity: 100,
    modulePadding: 30,
    petBorderRadius: 100,
    petHoverScale: 1.05,
    mainWidth: 900,
    fontFamily: "Verdana, sans-serif",
    hideHeader: true,
    hideFooter: true,
    petDisplay: "grid",
    petGridCols: 5,
    bioLayout: "grid",
    hideModuleHeaders: false,
  },
  {
    name: "Minimalist Grid",
    bgColor: "#ffffff",
    bgImage: "",
    bgAttachment: "scroll",
    moduleHeaderBg: "transparent",
    moduleHeaderText: "#222222",
    moduleBorder: "#dddddd",
    moduleBorderSize: 1,
    moduleContentBg: "transparent",
    textColor: "#444444",
    linkColor: "#888888",
    moduleBorderRadius: 0,
    moduleOpacity: 100,
    modulePadding: 50,
    petBorderRadius: 0,
    petHoverScale: 1,
    mainWidth: 1000,
    fontFamily: "Arial, sans-serif",
    hideHeader: true,
    hideFooter: true,
    petDisplay: "grid",
    petGridCols: 5,
    bioLayout: "grid",
    hideModuleHeaders: false,
  },
  {
    name: "Midnight Tech",
    bgColor: "#0a0a0a",
    bgImage: "",
    bgAttachment: "scroll",
    moduleHeaderBg: "#1a1a1a",
    moduleHeaderText: "#ffffff",
    moduleBorder: "#333333",
    moduleBorderSize: 1,
    moduleContentBg: "#111111",
    textColor: "#999999",
    linkColor: "#00ffcc",
    moduleBorderRadius: 2,
    moduleOpacity: 100,
    modulePadding: 20,
    petBorderRadius: 4,
    petHoverScale: 1.1,
    mainWidth: 960,
    fontFamily: "Verdana, sans-serif",
    hideHeader: true,
    hideFooter: true,
    petDisplay: "grid",
    petGridCols: 6,
    bioLayout: "grid",
    hideModuleHeaders: false,
  },
  {
    name: "Mystery Island Beach",
    bgColor: "#143a14",
    bgImage: "https://images.neopets.com/backgrounds/mystery_island_bg.gif",
    bgAttachment: "fixed",
    moduleHeaderBg: "#1e4d1e",
    moduleHeaderText: "#e0f2d8",
    moduleBorder: "transparent",
    moduleBorderSize: 0,
    moduleContentBg: "rgba(20, 58, 20, 0.8)",
    textColor: "#e0f2d8",
    linkColor: "#ffcc66",
    moduleBorderRadius: 30,
    moduleOpacity: 100,
    modulePadding: 20,
    petBorderRadius: 100,
    petHoverScale: 1.15,
    mainWidth: 800,
    fontFamily: "Arial, sans-serif",
    hideHeader: true,
    petDisplay: "grid",
    petGridCols: 2,
    bioLayout: "side-by-side",
    hideModuleHeaders: false,
  },
  {
    name: "Event Horizon",
    bgColor: "#000000",
    bgImage: "https://images.neopets.com/backgrounds/void_bg.jpg",
    bgAttachment: "fixed",
    moduleHeaderBg: "rgba(20, 0, 30, 0.9)",
    moduleHeaderText: "#cc99ff",
    moduleBorder: "#4a0080",
    moduleBorderSize: 1,
    moduleContentBg: "rgba(0, 0, 0, 0.9)",
    textColor: "#a894b5",
    linkColor: "#cc99ff",
    moduleBorderRadius: 15,
    moduleOpacity: 90,
    modulePadding: 20,
    petBorderRadius: 15,
    petHoverScale: 1.05,
    mainWidth: 800,
    fontFamily: "Courier New, monospace",
    hideHeader: true,
    hideEvents: true,
    hideNeohome: true,
    petDisplay: "grid",
    petGridCols: 3,
    bioLayout: "stacked",
    hideModuleHeaders: false,
  }
];

const DEFAULT_CONFIG: LookupConfig = {
  bgColor: '#ffffff',
  bgImage: '',
  bgAttachment: 'scroll',
  bgPosition: 'center',
  bgRepeat: 'repeat',
  bgSize: 'auto',
  moduleHeaderBg: '#822E2E',
  moduleHeaderText: '#ffffff',
  moduleFontSize: 10,
  moduleBorder: '#E4E4E4',
  moduleBorderSize: 1,
  moduleContentBg: '#ffffff',
  moduleOpacity: 100,
  textColor: '#000000',
  linkColor: '#000099',
  fontFamily: 'Verdana, Arial, Helvetica, sans-serif',
  fontSize: 11,
  headerFont: 'Verdana, Arial, Helvetica, sans-serif',
  headerFontSize: 10,
  headerTextColor: '#6d5b00',
  moduleFont: 'Verdana, Arial, Helvetica, sans-serif',
  hideHeader: false,
  hideFooter: false,
  hideTrophies: false,
  hideCollections: false,
  hideShop: false,
  hideNCMall: false,
  hidePetCarousel: false,
  hideULText: false,
  hideEvents: true,
  hideNeohome: true,
  petDisplay: 'carousel',
  petGridCols: 5,
  previewPetCount: 4,
  petBorderRadius: 24,
  petBorderSize: 1,
  petBorderColor: '#E4E4E4',
  petHoverScale: 1.05,
  petImageSize: 120,
  statsIconStyle: 'default',
  collapsibleTrophies: false,
  imageBorderRadius: 0,
  imagePadding: 0,
  imageBorderSize: 0,
  imageBgColor: 'transparent',
  moduleBorderRadius: 0,
  hideModuleHeaders: false,
  modulePadding: 15,
  customLinks: [],
  cursor: 'default',
  mainWidth: 650,
  mainMarginLeft: 0,
  mainMarginTop: 50,
  hideDefaultElements: true,
  hidePetDetails: false,
  matchTrophyBg: false,
  blendIcons: false,
  username: 'YourUsername',
  aboutMe: ``,
  bioSections: [
    {
      id: 'section-1',
      title: 'About',
      content: `<div style="display: flex; gap: 10px;">
  <div style="flex: 1;">
    <p>Welcome to my profile!</p>
    <p>This is a generic section. Feel free to replace it with information about yourself, your hobbies, or your Neopets.</p>
  </div>
</div>`
    },
    {
      id: 'section-2',
      title: 'Goals',
      content: `<div style="padding-left: 10px;">
  <b>Goal 1:</b> [0/10] <br/>
  <b>Goal 2:</b> [0/50] <br/>
  <b>Goal 3:</b> [0/100]<br/><br/>
  <i>"Replace this text with your own goals!"</i>
</div>`
    }
  ],
  bioLayout: 'side-by-side',
  userGenderColor: '#0000ff',
  petGenderColor: '#ff66b2',
  shieldUrl: 'https://images.neopets.com/images/shields/13_5_years.gif?v=2',
  shopkeeperUrl: '',
  galleryKeeperUrl: '',
  neohomeUrl: '',
  customAssets: [],
  pets: [
    { name: "Aisha", image: "https://pets.neopets.com/cp/n2jmxj4f/1/5.png", species: "Female Baby Aisha", age: "1,200", lvl: "5" },
    { name: "Draik", image: "https://pets.neopets.com/cp/oogcnsmk/1/5.png", species: "Male Mutant Draik", age: "800", lvl: "12" },
    { name: "Xweetok", image: "https://pets.neopets.com/cp/vwsv4k3g/1/5.png", species: "Female Faerie Xweetok", age: "2,500", lvl: "3" },
    { name: "Krawk", image: "https://pets.neopets.com/cp/3tshdjvx/1/5.png", species: "Male Pirate Krawk", age: "150", lvl: "1" }
  ],
  replaceNavbar: false,
  customNavbarHtml: `<div style="text-align: center; padding: 12px; background: #fafafa; border-bottom: 1px solid #eee; margin-bottom: 40px;">
  <a href="/" style="color: #666; margin: 0 20px; font-weight: bold; font-family: Verdana; font-size: 10px; text-transform: uppercase; letter-spacing: 2px;">Portfolio</a>
  <a href="/myaccount.phtml" style="color: #666; margin: 0 20px; font-weight: bold; font-family: Verdana; font-size: 10px; text-transform: uppercase; letter-spacing: 2px;">Account</a>
  <a href="/community/index.phtml" style="color: #666; margin: 0 20px; font-weight: bold; font-family: Verdana; font-size: 10px; text-transform: uppercase; letter-spacing: 2px;">Community</a>
  <a href="/objects.phtml?type=shop" style="color: #666; margin: 0 20px; font-weight: bold; font-family: Verdana; font-size: 10px; text-transform: uppercase; letter-spacing: 2px;">Shop</a>
</div>`,
  customCss: '',
  positions: {}
};

function BioSectionsEditor({
  config,
  updateBioSection,
  removeBioSection,
  addBioSection,
  editorDarkMode,
  totalLength
}: {
  config: Pick<LookupConfig, 'bioSections'>;
  updateBioSection: (id: string, key: 'title' | 'content', val: string) => void;
  removeBioSection: (id: string) => void;
  addBioSection: () => void;
  editorDarkMode: boolean;
  totalLength: number;
}) {
  return (
    <div className="space-y-6">
      {config.bioSections?.map((section) => (
        <div key={section.id} className="space-y-2 border rounded-xl p-3 bg-stone-50/50 dark:bg-stone-900/50 dark:border-stone-800">
          <div className="flex items-center justify-between">
            <input 
              type="text" 
              value={section.title} 
              onChange={(e) => updateBioSection(section.id, 'title', e.target.value)} 
              className={`text-xs font-bold uppercase tracking-widest bg-transparent outline-none w-full ${editorDarkMode ? 'text-stone-300' : 'text-stone-700'}`}
              placeholder="Section Title"
            />
            <button 
              onClick={() => removeBioSection(section.id)}
              className="text-red-500 hover:text-red-700 p-1"
              title="Remove Section"
            >
              <X size={14} />
            </button>
          </div>
          <RichTextEditor 
            value={section.content} 
            onChange={(v) => updateBioSection(section.id, 'content', v)} 
            darkMode={editorDarkMode} 
          />
        </div>
      ))}
      <button 
        onClick={addBioSection}
        className={`w-full py-3 border-2 border-dashed rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors ${editorDarkMode ? 'border-stone-800 text-stone-500 hover:text-stone-300 hover:bg-stone-900' : 'border-stone-200 text-stone-500 hover:text-red-800 hover:bg-red-50'}`}
      >
        + Add Section
      </button>

      <div className={`p-2 rounded-lg border flex items-center justify-between mt-2 ${totalLength > 5000 ? (editorDarkMode ? 'bg-red-950/50 border-red-900/50' : 'bg-red-50 border-red-200') : (editorDarkMode ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-200')}`}>
         <div className="text-[9px] font-black uppercase tracking-widest text-stone-500 flex items-center gap-1.5"><Code size={10} /> Total Code Length</div>
         <div className={`text-xs font-mono font-bold ${totalLength > 5000 ? 'text-red-500' : (editorDarkMode ? 'text-stone-300' : 'text-stone-700')}`}>
            {totalLength} / 5000
            {totalLength > 5000 && <span className="ml-1 text-[9px]">⚠️ Too big for limits</span>}
         </div>
      </div>
    </div>
  );
}

export default function App() {
  const [config, setConfig] = useState<LookupConfig>(DEFAULT_CONFIG);
  const [editingPart, setEditingPart] = useState<'style' | 'layout' | 'pets' | 'content' | 'images' | null>(null);
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [minifyCode, setMinifyCode] = useState(true);
  const [copied, setCopied] = useState(false);
  const [editorDarkMode, setEditorDarkMode] = useState(true);
  const [editorTheme, setEditorTheme] = useState<EditorTheme>('classic');
  const [activeTab, setActiveTab] = useState<'theme' | 'background' | 'layout' | 'typography' | 'effects' | 'pets' | 'content' | 'assets'>('theme');
  const [showSettings, setShowSettings] = useState(false);
  const [dragMode, setDragMode] = useState(false);
  const [showFilterCheck, setShowFilterCheck] = useState(false);
  const [importHtml, setImportHtml] = useState('');
  const [showImportSuccess, setShowImportSuccess] = useState(false);
  const [editableCode, setEditableCode] = useState('');

  const themeColors = useMemo(() => {
    let base = EDITOR_THEMES[editorTheme];
    // Special handling for classic if dark mode is on
    if (editorTheme === 'classic' && editorDarkMode) {
      return {
        ...base,
        bg: "bg-stone-950",
        text: "text-stone-100",
        border: "border-stone-800",
        secondary: "bg-stone-900/50"
      };
    }
    return base;
  }, [editorTheme, editorDarkMode]);

  const updateBioSection = (id: string, key: 'title' | 'content', val: string) => {
    setConfig(prev => ({
      ...prev,
      bioSections: prev.bioSections?.map(s => s.id === id ? { ...s, [key]: val } : s) || []
    }));
  };

  const removeBioSection = (id: string) => {
    setConfig(prev => ({
      ...prev,
      bioSections: prev.bioSections?.filter(s => s.id !== id) || []
    }));
  };

  const addBioSection = () => {
    const newId = `section-${Date.now()}`;
    setConfig(prev => ({
      ...prev,
      bioSections: [...(prev.bioSections || []), { id: newId, title: 'New Section', content: '' }]
    }));
  };

  const appendSnippet = (html: string, title: string) => {
    const newId = `section-${Date.now()}`;
    setConfig(prev => ({
      ...prev,
      bioSections: [...(prev.bioSections || []), { id: newId, title, content: html }]
    }));
  };

  const generatedCSS = useMemo(() => {
    let css = `<style>\n`;
    
    css += `body {\n  background-color: ${config.bgColor} !important;\n`;
    if (config.bgImage) {
      css += `  background-image: url("${config.bgImage}") !important;\n`;
      css += `  background-attachment: ${config.bgAttachment || 'scroll'} !important;\n`;
      css += `  background-position: ${config.bgPosition || 'center'} !important;\n`;
      css += `  background-repeat: ${config.bgRepeat || 'repeat'} !important;\n`;
      if (config.bgSize && config.bgSize !== 'auto') {
        css += `  background-size: ${config.bgSize} !important;\n`;
      }
    }
    css += `  color: ${config.textColor} !important;\n  font-family: ${config.fontFamily} !important;\n}\n\n`;
    
    if (config.hideDefaultElements) {
       css += `.content div a img, .content div b {\n  visibility: hidden !important;\n}\n`;
       css += `.contentModule div a img, .contentModule div b {\n  visibility: visible !important;\n}\n\n`;
    }

    const hiddenElements: string[] = [];
    if (config.hideHeader) hiddenElements.push('#header');
    if (config.hideFooter) hiddenElements.push('#footer', '.footerNifty', '.brand-mamabar');
    if (config.hideTrophies) hiddenElements.push('#usertrophies');
    if (config.hideCollections) hiddenElements.push('#usercollections');
    if (config.hideShop) hiddenElements.push('#usershop');
    if (config.hidePetCarousel) hiddenElements.push('#userneopets');
    if (config.hideNCMall) hiddenElements.push('#ncmall');
    if (config.hideNeohome) hiddenElements.push('#userneohome');
    if (config.hideEvents) hiddenElements.push('.pushdown', '#shh_prem_bg', '.randomEvent');
    if (config.hideULText) hiddenElements.push('#layer1 + .bumper + div');
    if (config.hideDefaultElements) hiddenElements.push('hr', '#bt', '#ban');
    if (config.replaceNavbar) hiddenElements.push('#header', '#ban', 'hr', '#bt', '.brand-mamabar', '.footerNifty');
    
    const uniqueHiddenElements = Array.from(new Set(hiddenElements));
    if (uniqueHiddenElements.length > 0) {
      css += `${uniqueHiddenElements.join(', ')} {\n  display: none !important;\n}\n\n`;
    }

    if (config.cursor !== 'default') {
      css += `body {\n  cursor: ${config.cursor} !important;\n}\n\n`;
    }

    if (config.headerFont !== config.fontFamily) {
      css += `#header, #header * {\n  font-family: ${config.headerFont} !important;\n}\n\n`;
    }

    css += `#content, #main {\n  margin: ${config.mainMarginTop}px auto 50px ${config.mainMarginLeft || 'auto'} !important;\n  width: ${config.mainWidth}px !important;\n  border: none !important;\n}\n\n`;

    css += `.contentModule, .contentModuleTable {\n  background-color: ${config.moduleContentBg} !important;\n  border: ${config.moduleBorderSize === 0 ? '0' : `${config.moduleBorderSize}px solid ${config.moduleBorder}`} !important;\n  border-radius: ${config.moduleBorderRadius}px !important;\n  overflow: hidden !important;\n${config.moduleFont !== config.fontFamily ? `  font-family: ${config.moduleFont} !important;\n` : ''}}\n\n`;
    
    if (config.hideModuleHeaders) {
      css += `.contentModuleHeader, .contentModuleHeaderAlt {\n  display: none !important;\n}\n`;
    } else {
      css += `.contentModuleHeader, .contentModuleHeaderAlt {\n  background-color: ${config.moduleHeaderBg} !important;\n  color: ${config.moduleHeaderText} !important;\n  border: 0 !important;\n${config.moduleFont !== config.fontFamily ? `  font-family: ${config.moduleFont} !important;\n` : ''}}\n`;
    }

    css += `.contentModuleContent {\n  padding: ${config.modulePadding}px !important;\n}\n\n`;
    
    css += `a:link, a:visited, a:hover {\n  color: ${config.linkColor} !important;\n  text-decoration: none !important;\n}\n\n`;
    
    css += `#userinfo b + b { color: ${config.userGenderColor} !important; }\n`;
    css += `#bxlist br + b { color: ${config.petGenderColor} !important; }\n\n`;
    
    if (config.petHoverScale !== 1) {
      css += `#userneopets li:hover div,\n#userneopets li:hover a img {\n  transform: scale(${config.petHoverScale}) !important;\n  z-index: 10 !important;\n  position: relative !important;\n}\n`;
      css += `#userneopets li div,\n#userneopets li a img {\n  transition: transform 0.3s ease !important;\n}\n\n`;
    }

    const petCommonImgCss = `
  object-fit: contain !important;
${config.petBorderRadius ? `  border-radius: ${config.petBorderRadius}px !important;\n` : ''}${config.petBorderSize === 0 ? `  border: 0 !important;\n` : `  border: ${config.petBorderSize}px solid ${config.petBorderColor} !important;\n`}  box-sizing: border-box !important;
  display: block !important;
  margin: 0 auto !important;
}\n\n`;

    if (config.petDisplay === 'grid') {
      // Grid specific CSS
      css += `#userneopets{clear:both!important} .bx-viewport{overflow:visible!important;height:auto!important;width:100%!important} .bx-wrapper{max-width:100%!important;height:auto!important;margin:0 auto!important} #userneopets .bx-controls,#userneopets .bx-pager,#userneopets .bx-prev,#userneopets .bx-next,#userneopets li.bx-clone{display:none!important}
#userneopets ul,#userneopets .bxslider{display:block!important;width:100%!important;padding:0!important;transform:none!important;left:auto!important;text-align:center!important;white-space:normal!important;box-sizing:border-box!important}
`;
      
      const colWidth = Math.floor(100 / (config.petGridCols || 5)) - 2;
      css += `#userneopets li:not(.bx-clone){display:inline-block!important;vertical-align:top!important;width:${colWidth}%!important;max-width:150px!important;min-width:80px!important;margin:10px 1%!important;float:none!important;position:static!important}\n`;
      
      css += `#userneopets li center {\n  margin-top: 5px !important;\n}\n`;

      css += `.hp_img, #userneopets img, #userneopets li img, #userneopets .bx-wrapper img {\n  width: 100% !important;\n  max-width: ${config.petImageSize || 120}px !important;\n  height: auto !important;\n  aspect-ratio: 1/1 !important;\n` + petCommonImgCss;
    } else {
      css += `.hp_img, #userneopets img, #userneopets li img, #userneopets .bx-wrapper img {\n  width: ${config.petImageSize || 120}px !important;\n  height: ${config.petImageSize || 120}px !important;\n` + petCommonImgCss;
    }

    if (config.hidePetDetails) {
      css += `#bxlist center { height: 26px; overflow: hidden; }\n`;
    }

    if (config.imagePadding > 0 || config.imageBgColor !== 'transparent' || config.imageBorderRadius > 0 || config.imageBorderSize > 0) {
      css += `#usercollections img, #usershop img, #usertrophies img, #ncmall img, #userinfo img {\n${config.imagePadding ? `  padding: ${config.imagePadding}px !important;\n` : ''}${config.imageBgColor !== 'transparent' ? `  background: ${config.imageBgColor} !important;\n` : ''}${config.imageBorderRadius ? `  border-radius: ${config.imageBorderRadius}px !important;\n` : ''}${config.imageBorderSize ? `  border: ${config.imageBorderSize}px solid ${config.moduleBorder} !important;\n` : ''}  max-width: 80px !important;\n  max-height: 80px !important;\n  box-sizing: border-box !important;\n}\n\n`;
    }

    if (config.statsIconStyle === 'circles') {
      css += `#userinfo table table td td a { width: 25px !important; height: 25px !important; display: block !important; background: ${config.moduleHeaderBg} !important; border-radius: 100px !important; }\n`;
      css += `#userinfo table table td td img { visibility: hidden !important; }\n`;
      css += `#userinfo table table td td { color: ${config.textColor} !important; }\n`;
    } else if (config.statsIconStyle === 'bars') {
      css += `#userinfo table table td td a { width: 50px !important; height: 8px !important; display: block !important; margin-top: 5px !important; background: ${config.moduleHeaderBg} !important; }\n`;
      css += `#userinfo table table td td img { visibility: hidden !important; }\n`;
      css += `#userinfo table table td td { color: ${config.textColor} !important; }\n`;
    } else if (config.statsIconStyle === 'hidden') {
       css += `#userinfo table table td td a img { display: none !important; }\n`;
    }

    if (config.collapsibleTrophies) {
      css += `#usertrophies { height: 100px !important; overflow: hidden !important; transition: height 0.3s ease !important; }\n`;
      css += `#usertrophies:hover { height: auto !important; }\n`;
    }

    if (config.matchTrophyBg) {
      css += `#usertrophies img { background: #fff !important; }\n`;
    }

    if (config.blendIcons) {
      css += `#usercollections img, #usershop img, #usertrophies img, #ncmall img, #userinfo img {\n  padding: 4px;\n  background: #FFF;\n  border-radius: 10px;\n  border: 1px solid ${config.moduleBorder};\n}\n`;
    }

    if (config.galleryKeeperUrl) {
      css += `div.tablestyle center img { width: 0; height: 150px; }\n`;
      css += `p ~ div.tablestyle center { background: url("${config.galleryKeeperUrl}") no-repeat center 15px / 150px 150px !important; }\n`;
    }

    if (config.replaceNavbar) {
      css += `.custom_navbar_container {\n  position: ${config.bgAttachment === 'fixed' ? 'fixed' : 'absolute'} !important;\n  top: 0 !important;\n  left: 0 !important;\n  width: 100% !important;\n  z-index: 5000 !important;\n}\n`;
      css += `body {\n  padding-top: 50px !important;\n}\n`;
    }
    
    if (Object.keys(config.positions || {}).length > 0) {
      (Object.entries(config.positions || {}) as [string, {x: number, y: number}][]).forEach(([id, pos]) => {
        if (pos.x !== 0 || pos.y !== 0) {
          css += `#${id} {\n  position: relative !important;\n  left: ${Math.round(pos.x)}px !important;\n  top: ${Math.round(pos.y)}px !important;\n}\n`;
        }
      });
    }

    config.customAssets.forEach((asset, i) => {
      css += `#custom_asset_${i} {\n  position: absolute !important;\n  left: ${asset.x}px !important;\n  top: ${asset.y}px !important;\n  width: ${asset.width}px !important;\n  z-index: 1000 !important;\n}\n`;
    });

    if (config.customCss) {
      css += `\n${config.customCss}\n`;
    }

    css += `</style>`;

    if (config.replaceNavbar && config.customNavbarHtml) {
      css += `\n<div class="custom_navbar_container">\n  ${config.customNavbarHtml}\n</div>\n`;
    }

    config.customAssets.forEach((asset, i) => {
      css += `\n<img src="${asset.url}" id="custom_asset_${i}" />\n`;
    });

    if (config.bioSections && config.bioSections.length > 0) {
      if (config.bioLayout === 'side-by-side') {
        css += `<div style="display: table; width: 100%; border-spacing: 15px;">\n`;
        config.bioSections.forEach(section => {
          css += `<div style="display: table-cell; vertical-align: top;">\n${section.content}\n</div>\n`;
        });
        css += `</div>\n`;
      } else if (config.bioLayout === 'grid') {
        css += `<div style="display: flex; flex-wrap: wrap; gap: 15px; justify-content: space-around;">\n`;
        config.bioSections.forEach(section => {
          css += `<div style="flex: 1 1 300px;">\n${section.content}\n</div>\n`;
        });
        css += `</div>\n`;
      } else {
        config.bioSections.forEach(section => {
          css += `<div style="margin-bottom: 20px;">\n${section.content}\n</div>\n`;
        });
      }
    } else if (config.aboutMe) {
      css += `\n${config.aboutMe}\n`;
    }

    if (minifyCode) {
      const styleMatch = css.match(/<style>([\s\S]*?)<\/style>/i);
      if (styleMatch) {
        const minifiedStyle = styleMatch[1]
          .replace(/\n\s*/g, '')
          .replace(/\s*{\s*/g, '{')
          .replace(/\s*}\s*/g, '}')
          .replace(/\s*;\s*/g, ';')
          .replace(/\s*:\s*/g, ':')
          .replace(/\/\*[\s\S]*?\*\//g, '');
        css = css.replace(styleMatch[0], `<style>${minifiedStyle}</style>`);
      }
      
      const navMatch = css.match(/<div class="custom_navbar_container">([\s\S]*?)<\/div>/i);
      if (navMatch) {
         const minNav = navMatch[1].replace(/\n\s*/g, ' ');
         css = css.replace(navMatch[0], `<div class="custom_navbar_container">${minNav}</div>`);
      }
    }
    
    return css;
  }, [config, minifyCode]);

  // Sync editableCode from generatedCSS when showCode is toggled
  React.useEffect(() => {
    if (showCode) {
      setEditableCode(generatedCSS);
    }
  }, [showCode, generatedCSS]);

  const filterWarnings = useMemo(() => {
    const warnings: { type: 'error' | 'warning' | 'info', message: string }[] = [];
    const css = generatedCSS.toLowerCase();

    if (config.bgAttachment === 'fixed') {
      warnings.push({ type: 'info', message: "Fixed background attachments can behave unpredictably on mobile browser layouts for Neopets." });
    }
    if (css.includes('position: fixed') || css.includes('position: absolute')) {
      warnings.push({ type: 'warning', message: "Using absolute/fixed position. Neopets classic lookups may strip these properties. Best to apply them to children of #main or inline safely." });
    }
    if (css.includes('display: flex') || css.includes('display: grid')) {
      warnings.push({ type: 'info', message: "Flexbox/Grid are modern properties. Although increasingly supported on Neopets, older petpages or pages may strip them." });
    }
    if (css.includes('<script') || css.includes('javascript:')) {
      warnings.push({ type: 'error', message: "CRITICAL: Scripts are strictly forbidden on Neopets and will be wiped automatically." });
    }
    if (css.match(/<(iframe|object|embed)/i)) {
      warnings.push({ type: 'error', message: "CRITICAL: Embeds (iframes/objects) are blocked by Neopets filters." });
    }
    if (config.bioSections?.some(s => s.content.includes('<style>'))) {
      warnings.push({ type: 'warning', message: "Avoid putting <style> tags in the biography block as it can confuse WYSIWYG editors on Neopets. Place CSS in the main stylesheet block." });
    }
    if (css.includes('z-index') && css.includes('9999')) {
      warnings.push({ type: 'info', message: "Very high z-indexes may overlay site navigation on Neopets. Ensure they aren't covering the top user bar." });
    }

    return warnings;
  }, [generatedCSS, config]);

  const onManualCodeChange = (code: string) => {
    setEditableCode(code);
    const parsed = parseGeneratedCode(code);
    if (!('customCss' in parsed)) {
      parsed.customCss = '';
    }
    if (Object.keys(parsed).length > 0) {
      setConfig(prev => ({ ...prev, ...parsed }));
    }
  };

  const updateConfig = (key: keyof LookupConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const insertTag = (tag: string, attr: string = '') => {
    const textarea = document.getElementById('bio-textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const middle = text.substring(start, end);
    const after = text.substring(end);

    const openTag = attr ? `<${tag} ${attr}>` : `<${tag}>`;
    const closeTag = `</${tag}>`;
    const newText = before + openTag + middle + closeTag + after;

    updateConfig('aboutMe', newText);
    
    // Reset focus
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + openTag.length, end + openTag.length);
    }, 0);
  };

  return (
    <div className={`flex h-screen overflow-hidden font-sans transition-colors duration-500 ${themeColors.bg} ${themeColors.text}`}>
      {/* Sidebar Editor */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarMinimized ? 40 : 420 }}
        className={`flex-shrink-0 flex flex-col z-20 relative transition-colors ${themeColors.bg}`}
      >
        {/* Right Border for aside */}
        <div className={`absolute top-0 bottom-0 right-0 w-px border-r ${themeColors.border}`} />

        <div className="absolute top-8 -right-3 z-[60]">
          <EditorTooltip text={isSidebarMinimized ? "Expand Editor" : "Minimize Editor"}>
            <button 
              onClick={() => setIsSidebarMinimized(!isSidebarMinimized)}
              className={`p-1 rounded-full border shadow-md transition-all ${editorDarkMode ? 'bg-stone-800 border-stone-700 text-stone-400 hover:text-white hover:border-red-500' : 'bg-white border-stone-200 text-stone-500 hover:text-red-800 hover:border-red-200'}`}
            >
              {isSidebarMinimized ? <ChevronRight size={12} strokeWidth={4} /> : <ChevronLeft size={12} strokeWidth={4} />}
            </button>
          </EditorTooltip>
        </div>

        <div className="absolute inset-0 overflow-hidden">
          <div className={`flex flex-col h-full w-[420px] shrink-0 overflow-hidden ${isSidebarMinimized ? 'opacity-0 pointer-events-none' : 'opacity-100'} transition-opacity duration-300`}>
            <div className={`p-5 border-b flex items-center justify-between transition-colors ${themeColors.secondary} ${themeColors.border}`}>
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <div className="bg-red-800 p-1.5 rounded shadow-sm">
                  <Palette className="text-white w-4 h-4" />
                </div>
              <h1 className={`font-black tracking-tight text-lg uppercase italic ${editorDarkMode ? 'text-red-500' : 'text-red-900'}`}>Neocode.UL</h1>
            </div>
            <p className={`text-[9px] font-bold uppercase tracking-[0.2em] ml-1 ${editorDarkMode ? 'text-stone-500' : 'text-stone-500'}`}>Visual CSS Wizard</p>
          </div>
          <EditorTooltip text="Master Settings & Tools">
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-xl transition-all ${showSettings ? 'rotate-90 bg-red-800 text-white shadow-lg' : (editorDarkMode ? 'bg-stone-800 text-stone-400 hover:bg-stone-700' : 'bg-stone-100 text-stone-600 hover:bg-stone-200')}`}
            >
              <Settings size={14} />
            </button>
          </EditorTooltip>
        </div>

        <div className="flex-1 overflow-hidden flex">
          <nav className={`w-[90px] shrink-0 flex flex-col items-center gap-1.5 p-2 border-r overflow-y-auto transition-colors ${themeColors.bg} ${themeColors.border}`}>
            <TabBtn active={activeTab === 'theme'} onClick={() => setActiveTab('theme')} label="Theme" icon={Palette} darkMode={editorDarkMode} />
            <TabBtn active={activeTab === 'background'} onClick={() => setActiveTab('background')} label="Backdrop" icon={ImageIcon} darkMode={editorDarkMode} />
            <TabBtn active={activeTab === 'layout'} onClick={() => setActiveTab('layout')} label="Layout" icon={Layout} darkMode={editorDarkMode} />
            <TabBtn active={activeTab === 'typography'} onClick={() => setActiveTab('typography')} label="Fonts" icon={Type} darkMode={editorDarkMode} />
            <TabBtn active={activeTab === 'effects'} onClick={() => setActiveTab('effects')} label="Effects" icon={Wand2} darkMode={editorDarkMode} />
            <TabBtn active={activeTab === 'pets'} onClick={() => setActiveTab('pets')} label="Pets" icon={Star} darkMode={editorDarkMode} />
            <TabBtn active={activeTab === 'content'} onClick={() => setActiveTab('content')} label="Content" icon={FileText} darkMode={editorDarkMode} />
            <TabBtn active={activeTab === 'assets'} onClick={() => setActiveTab('assets')} label="Assets" icon={FolderOpen} darkMode={editorDarkMode} />
          </nav>

          <div className="flex-1 overflow-y-auto p-5 space-y-8 pb-32">
            {activeTab === 'theme' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
                <section className="space-y-4">
                  <h3 className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${editorDarkMode ? 'text-stone-500' : 'text-stone-400'}`}>Template Library</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {TEMPLATES.map(template => (
                      <button
                        key={template.name}
                        onClick={() => {
                          setConfig(prev => ({ ...prev, ...template }));
                        }}
                        className={`group p-3 rounded-xl flex flex-col gap-3 text-left border transition-all ${editorDarkMode ? 'bg-stone-900 border-stone-800 hover:bg-stone-800 hover:border-stone-600' : 'bg-white border-stone-200 hover:bg-stone-50 hover:border-red-300 shadow-sm'}`}
                      >
                        <div className="w-full h-20 rounded-lg overflow-hidden border shadow-inner relative flex flex-col items-center p-2" style={{ backgroundColor: template.bgColor }}>
                           {template.bgImage && (
                             <div className="absolute inset-0 opacity-40 bg-cover bg-center" style={{ backgroundImage: `url(${template.bgImage})` }} />
                           )}
                          <div className="w-full h-full rounded shadow-sm flex flex-col overflow-hidden relative z-10" style={{ backgroundColor: template.moduleContentBg, border: `${template.moduleBorderSize}px solid ${template.moduleBorder}` }}>
                             <div className="w-full shrink-0 flex items-center px-1.5 h-3" style={{ backgroundColor: template.moduleHeaderBg !== 'transparent' ? template.moduleHeaderBg : 'rgba(0,0,0,0.1)' }}>
                               <div className="w-4 h-0.5 rounded-full" style={{ backgroundColor: template.moduleHeaderText }} />
                             </div>
                             <div className="flex-1 p-1.5 flex gap-1.5 items-start">
                                <div className="w-4 h-4 shrink-0 rounded-full" style={{ backgroundColor: template.linkColor, opacity: 0.8 }} />
                                <div className="flex-1 space-y-1">
                                  <div className="w-full h-0.5 rounded-full" style={{ backgroundColor: template.textColor, opacity: 0.6 }} />
                                  <div className="w-2/3 h-0.5 rounded-full" style={{ backgroundColor: template.textColor, opacity: 0.6 }} />
                                  <div className="w-4/5 h-0.5 rounded-full" style={{ backgroundColor: template.textColor, opacity: 0.6 }} />
                                </div>
                             </div>
                          </div>
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-tight ${editorDarkMode ? 'text-stone-300' : 'text-stone-700'}`}>{template.name}</span>
                      </button>
                    ))}
                  </div>
                </section>

                <section className="space-y-4 pt-6 border-t border-stone-100">
                  <h3 className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${editorDarkMode ? 'text-stone-500' : 'text-stone-400'}`}>Theme Colors</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <ColorSetting label="Page BG" value={config.bgColor} onChange={(v) => updateConfig('bgColor', v)} darkMode={editorDarkMode} />
                    <ColorSetting label="Text Color" value={config.textColor} onChange={(v) => updateConfig('textColor', v)} darkMode={editorDarkMode} />
                    <ColorSetting label="Link Color" value={config.linkColor} onChange={(v) => updateConfig('linkColor', v)} darkMode={editorDarkMode} />
                    <ColorSetting label="Header BG" value={config.moduleHeaderBg} onChange={(v) => updateConfig('moduleHeaderBg', v)} darkMode={editorDarkMode} />
                    <ColorSetting label="Header Color" value={config.moduleHeaderText} onChange={(v) => updateConfig('moduleHeaderText', v)} darkMode={editorDarkMode} />
                    <ColorSetting label="Content BG" value={config.moduleContentBg} onChange={(v) => updateConfig('moduleContentBg', v)} darkMode={editorDarkMode} />
                    <ColorSetting label="Border Color" value={config.moduleBorder} onChange={(v) => updateConfig('moduleBorder', v)} darkMode={editorDarkMode} />
                    <ColorSetting label="User Color" value={config.userGenderColor} onChange={(v) => updateConfig('userGenderColor', v)} darkMode={editorDarkMode} />
                    <ColorSetting label="Pet Color" value={config.petGenderColor} onChange={(v) => updateConfig('petGenderColor', v)} darkMode={editorDarkMode} />
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'background' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
                <section className="space-y-4">
                  <h3 className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${editorDarkMode ? 'text-stone-500' : 'text-stone-400'}`}>Background & Image</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-[9px] font-bold uppercase block mb-1">Background Image URL</label>
                      <input 
                        type="text" 
                        value={config.bgImage} 
                        onChange={(e) => updateConfig('bgImage', e.target.value)} 
                        placeholder="https://..."
                        className={`w-full p-2 border rounded-lg text-xs ${editorDarkMode ? 'bg-stone-900 border-stone-800 text-stone-300 placeholder:text-stone-600' : 'bg-white'}`} 
                      />
                    </div>
                    {config.bgImage && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-[9px] font-bold uppercase block mb-1">Attachment</label>
                            <select value={config.bgAttachment} onChange={(e) => updateConfig('bgAttachment', e.target.value)} className={`w-full p-2 border rounded-lg text-xs ${editorDarkMode ? 'bg-stone-900 border-stone-800 text-stone-300' : 'bg-white'}`}>
                              <option value="scroll">Scroll</option>
                              <option value="fixed">Fixed</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[9px] font-bold uppercase block mb-1">Repeat</label>
                            <select value={config.bgRepeat} onChange={(e) => updateConfig('bgRepeat', e.target.value)} className={`w-full p-2 border rounded-lg text-xs ${editorDarkMode ? 'bg-stone-900 border-stone-800 text-stone-300' : 'bg-white'}`}>
                              <option value="repeat">Repeat</option>
                              <option value="no-repeat">No Repeat</option>
                              <option value="repeat-x">Repeat X</option>
                              <option value="repeat-y">Repeat Y</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'typography' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
                <section className="space-y-4">
                  <h3 className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${editorDarkMode ? 'text-stone-500' : 'text-stone-400'}`}>Typography Setup</h3>
                  <div className="space-y-4">
                    <FontSelect label="Global Body Font" value={config.fontFamily} onChange={(v) => updateConfig('fontFamily', v)} darkMode={editorDarkMode} />
                    <FontSelect label="Site Header Font" value={config.headerFont} onChange={(v) => updateConfig('headerFont', v)} darkMode={editorDarkMode} />
                    <FontSelect label="Module Font" value={config.moduleFont} onChange={(v) => updateConfig('moduleFont', v)} darkMode={editorDarkMode} />
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'effects' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
                <section className="space-y-4">
                  <h3 className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${editorDarkMode ? 'text-stone-500' : 'text-stone-400'}`}>Polish & Effects</h3>
                  <div>
                    <label className="text-[9px] font-bold uppercase block mb-1">Custom Cursor</label>
                    <select value={config.cursor} onChange={(e) => updateConfig('cursor', e.target.value)} className={`w-full p-2 border rounded-lg text-xs mb-3 ${editorDarkMode ? 'bg-stone-900 border-stone-800 text-stone-300' : 'bg-white'}`}>
                      <option value="default">Default</option>
                      <option value="crosshair">Crosshair</option>
                      <option value="help">Help</option>
                      <option value="wait">Wait</option>
                      <option value="copy">Copy</option>
                      <option value="neopets">Classic Neopets</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <ToggleRow label="Blend Icons & Trophies" checked={config.blendIcons} onChange={(v) => updateConfig('blendIcons', v)} darkMode={editorDarkMode} />
                    <ToggleRow label="Force White Trophy BGs" checked={config.matchTrophyBg} onChange={(v) => updateConfig('matchTrophyBg', v)} darkMode={editorDarkMode} />
                  </div>

                  <div className={`p-4 mt-4 rounded-2xl border ${editorDarkMode ? 'bg-stone-900 border-stone-800' : 'bg-stone-50 border-stone-100/50'}`}>
                    <label className="text-[10px] font-black uppercase tracking-widest block mb-2">Custom Cursor</label>
                    <select 
                      value={config.cursor || 'default'} 
                      onChange={(e) => updateConfig('cursor', e.target.value)} 
                      className={`w-full p-2 border rounded-lg text-xs ${editorDarkMode ? 'bg-stone-900 border-stone-800 text-stone-300' : 'bg-white'}`}
                    >
                      <option value="default">Default</option>
                      <option value="crosshair">Crosshair</option>
                      <option value="pointer">Pointer</option>
                      <option value="wait">Wait</option>
                      <option value="help">Help</option>
                      <option value="move">Move</option>
                      <option value="grab">Grab</option>
                      <option value="none">None (Hidden)</option>
                      <option value="url('https://images.neopets.com/cursor/default.cur'), auto">Neopets Classic</option>
                    </select>
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'layout' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                <section className="space-y-4">
                  <h3 className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${editorDarkMode ? 'text-stone-500' : 'text-stone-400'}`}>Box Geometry & Radius</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[9px] font-bold uppercase block mb-1 text-stone-500">Module Radius</label>
                      <input type="number" value={config.moduleBorderRadius} onChange={(e) => updateConfig('moduleBorderRadius', parseInt(e.target.value) || 0)} className={`w-full p-2 border rounded-lg text-xs ${editorDarkMode ? 'bg-stone-900 border-stone-800 text-stone-300' : 'bg-white'}`} />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold uppercase block mb-1 text-stone-500">Pet Box Radius</label>
                      <input type="number" value={config.petBorderRadius} onChange={(e) => updateConfig('petBorderRadius', parseInt(e.target.value) || 0)} className={`w-full p-2 border rounded-lg text-xs ${editorDarkMode ? 'bg-stone-900 border-stone-800 text-stone-300' : 'bg-white'}`} />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold uppercase block mb-1 text-stone-500">Module Border</label>
                      <input type="number" value={config.moduleBorderSize} onChange={(e) => updateConfig('moduleBorderSize', parseInt(e.target.value) || 0)} className={`w-full p-2 border rounded-lg text-xs ${editorDarkMode ? 'bg-stone-900 border-stone-800 text-stone-300' : 'bg-white'}`} />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold uppercase block mb-1 text-stone-500">Pet Border</label>
                      <input type="number" value={config.petBorderSize} onChange={(e) => updateConfig('petBorderSize', parseInt(e.target.value) || 0)} className={`w-full p-2 border rounded-lg text-xs ${editorDarkMode ? 'bg-stone-900 border-stone-800 text-stone-300' : 'bg-white'}`} />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold uppercase block mb-1 text-stone-500">Box Padding</label>
                      <input type="number" value={config.modulePadding} onChange={(e) => updateConfig('modulePadding', parseInt(e.target.value) || 0)} className={`w-full p-2 border rounded-lg text-xs ${editorDarkMode ? 'bg-stone-900 border-stone-800 text-stone-300' : 'bg-white'}`} />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold uppercase block mb-1 text-stone-500">Global Width</label>
                      <input type="number" value={config.mainWidth} onChange={(e) => updateConfig('mainWidth', parseInt(e.target.value) || 600)} className={`w-full p-2 border rounded-lg text-xs ${editorDarkMode ? 'bg-stone-900 border-stone-800 text-stone-300' : 'bg-white'}`} />
                    </div>
                  </div>

                  <section className="space-y-4 pt-6 border-t border-stone-100/50">
                    <h3 className={`text-[10px] font-black uppercase tracking-widest ${editorDarkMode ? 'text-stone-500' : 'text-stone-400'}`}>Global Image Aesthetics</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[9px] font-bold uppercase block mb-1 text-stone-500">Image Radius</label>
                        <input type="number" value={config.imageBorderRadius} onChange={(e) => updateConfig('imageBorderRadius', parseInt(e.target.value) || 0)} className={`w-full p-2 border rounded-lg text-xs ${editorDarkMode ? 'bg-stone-900 border-stone-800 text-stone-300' : 'bg-white'}`} />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold uppercase block mb-1 text-stone-500">Image Padding</label>
                        <input type="number" value={config.imagePadding} onChange={(e) => updateConfig('imagePadding', parseInt(e.target.value) || 0)} className={`w-full p-2 border rounded-lg text-xs ${editorDarkMode ? 'bg-stone-900 border-stone-800 text-stone-300' : 'bg-white'}`} />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold uppercase block mb-1 text-stone-500">Image Border</label>
                        <input type="number" value={config.imageBorderSize} onChange={(e) => updateConfig('imageBorderSize', parseInt(e.target.value) || 0)} className={`w-full p-2 border rounded-lg text-xs ${editorDarkMode ? 'bg-stone-900 border-stone-800 text-stone-300' : 'bg-white'}`} />
                      </div>
                      <ColorSetting label="Image BG" value={config.imageBgColor} onChange={(v) => updateConfig('imageBgColor', v)} darkMode={editorDarkMode} />
                    </div>
                    <p className="text-[8px] text-stone-400 italic">Applies to trophies, gallery items, and collection icons.</p>
                  </section>
                </section>

                <section className="space-y-4 pt-6 border-t border-stone-100">
                  <h3 className={`text-[10px] font-black uppercase tracking-widest ${editorDarkMode ? 'text-stone-500' : 'text-stone-400'}`}>Draggable Positioning</h3>
                  <div className="space-y-1">
                     <ToggleRow 
                       label="Free Position Modules" 
                       description="Click and drag modules in the preview to move them manually."
                       checked={dragMode} 
                       onChange={(v) => {
                         setDragMode(v);
                         if (v) {
                           toast.info('Drag Mode Active', { description: 'You can now click and drag modules around in the preview.' });
                         }
                       }} 
                       darkMode={editorDarkMode} 
                     />
                     {Object.keys(config.positions || {}).length > 0 && (
                        <button 
                          onClick={() => { updateConfig('positions', {}); toast.success('Positions reset to default'); }}
                          className={`w-full mt-2 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors ${editorDarkMode ? 'bg-red-900/20 text-red-400 hover:bg-red-900/40' : 'bg-red-50 text-red-800 hover:bg-red-100'}`}
                        >
                          Reset All Positions
                        </button>
                     )}
                  </div>
                </section>

                <section className="space-y-4 pt-6 border-t border-stone-100">
                  <h3 className={`text-[10px] font-black uppercase tracking-widest ${editorDarkMode ? 'text-stone-500' : 'text-stone-400'}`}>Visibility</h3>
                  <div className="space-y-1">
                    <ToggleRow label="Hide Default NP UI" checked={config.hideDefaultElements} onChange={(v) => updateConfig('hideDefaultElements', v)} darkMode={editorDarkMode} />
                    <ToggleRow label="Hide Module Headers" checked={config.hideModuleHeaders} onChange={(v) => updateConfig('hideModuleHeaders', v)} darkMode={editorDarkMode} />
                    <ToggleRow label="Site Header & Navbar" checked={!config.hideHeader} onChange={(v) => updateConfig('hideHeader', !v)} darkMode={editorDarkMode} />
                    <div className="pl-6 space-y-3">
                      <ToggleRow label="Replace with Custom Navbar" checked={config.replaceNavbar} onChange={(v) => updateConfig('replaceNavbar', v)} darkMode={editorDarkMode} />
                      {config.replaceNavbar && (
                        <textarea
                          value={config.customNavbarHtml}
                          onChange={(e) => updateConfig('customNavbarHtml', e.target.value)}
                          className={`w-full h-32 p-3 font-mono text-[10px] border rounded-xl outline-none focus:ring-2 focus:ring-red-800/20 ${editorDarkMode ? 'bg-stone-950 border-stone-800 text-stone-500' : 'bg-stone-50'}`}
                          placeholder="Paste custom HTML for the navbar..."
                        />
                      )}
                    </div>
                    <ToggleRow label="Site Footer" checked={!config.hideFooter} onChange={(v) => updateConfig('hideFooter', !v)} darkMode={editorDarkMode} />
                    <ToggleRow label="Collections" checked={!config.hideCollections} onChange={(v) => updateConfig('hideCollections', !v)} darkMode={editorDarkMode} />
                    <ToggleRow label="Shop & Gallery" checked={!config.hideShop} onChange={(v) => updateConfig('hideShop', !v)} darkMode={editorDarkMode} />
                    <ToggleRow label="Trophies" checked={!config.hideTrophies} onChange={(v) => updateConfig('hideTrophies', !v)} darkMode={editorDarkMode} />
                    {!config.hideTrophies && (
                      <ToggleRow label="Collapsible Trophies" description="Hide trophies until hovered" checked={!!config.collapsibleTrophies} onChange={(v) => updateConfig('collapsibleTrophies', v)} darkMode={editorDarkMode} />
                    )}
                    <ToggleRow label="Pet Carousel" checked={!config.hidePetCarousel} onChange={(v) => updateConfig('hidePetCarousel', !v)} darkMode={editorDarkMode} />
                    <ToggleRow label="Random Events/Banners" checked={!config.hideEvents} onChange={(v) => updateConfig('hideEvents', !v)} darkMode={editorDarkMode} />
                    <ToggleRow label="User Lookup Text" checked={!config.hideULText} onChange={(v) => updateConfig('hideULText', !v)} darkMode={editorDarkMode} />
                    <ToggleRow label="Neohome Module" checked={!config.hideNeohome} onChange={(v) => updateConfig('hideNeohome', !v)} darkMode={editorDarkMode} />
                  </div>
                </section>

                <section className="space-y-3">
                  <h3 className={`text-[10px] font-black uppercase tracking-widest ${editorDarkMode ? 'text-stone-500' : 'text-stone-400'}`}>Advanced Styles</h3>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-bold p-1">
                      <span>User Info Icons</span>
                      <select 
                        value={config.statsIconStyle || 'default'} 
                        onChange={(e) => updateConfig('statsIconStyle', e.target.value)}
                        className={`text-[9px] uppercase tracking-wider p-1 rounded font-bold outline-none ${editorDarkMode ? 'bg-stone-800 text-stone-300' : 'bg-stone-100 text-stone-600'}`}
                      >
                        <option value="default">Default Images</option>
                        <option value="circles">Colored Circles</option>
                        <option value="bars">Colored Bars</option>
                        <option value="hidden">Hidden</option>
                      </select>
                    </div>
                  </div>
                </section>

                <section className="space-y-4 pt-6 border-t border-stone-100/50">
                  <h3 className={`text-[10px] font-black uppercase tracking-widest ${editorDarkMode ? 'text-stone-500' : 'text-stone-400'}`}>Dimensions</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[9px] font-bold uppercase block mb-1">Width (px)</label>
                      <input type="number" value={config.mainWidth} onChange={(e) => updateConfig('mainWidth', parseInt(e.target.value) || 0)} className={`w-full p-2 border rounded-lg text-xs ${editorDarkMode ? 'bg-stone-900 border-stone-800 text-stone-300' : 'bg-white'}`} />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold uppercase block mb-1">Top Margin</label>
                      <input type="number" value={config.mainMarginTop} onChange={(e) => updateConfig('mainMarginTop', parseInt(e.target.value) || 0)} className={`w-full p-2 border rounded-lg text-xs ${editorDarkMode ? 'bg-stone-900 border-stone-800 text-stone-300' : 'bg-white'}`} />
                    </div>
                  </div>
                    <div>
                      <label className="text-[9px] font-bold uppercase block mb-1">Side Offset</label>
                      <input type="number" value={config.mainMarginLeft} onChange={(e) => updateConfig('mainMarginLeft', parseInt(e.target.value) || 0)} className={`w-full p-2 border rounded-lg text-xs ${editorDarkMode ? 'bg-stone-900 border-stone-800 text-stone-300' : 'bg-white'}`} placeholder="Center (0)" />
                    </div>
                </section>
              </div>
            )}

            {activeTab === 'pets' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                <section className="space-y-4">
                  <h3 className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${editorDarkMode ? 'text-stone-500' : 'text-stone-400'}`}>Display Mode</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => updateConfig('petDisplay', 'carousel')}
                      className={`py-3 rounded-lg border text-[9px] font-black uppercase tracking-tight transition-all ${config.petDisplay === 'carousel' ? 'bg-red-800 text-white border-red-800 shadow-md' : (editorDarkMode ? 'bg-stone-800 text-stone-400 border-stone-700' : 'bg-stone-50 text-stone-500 border-stone-200')}`}
                    >
                      Carousel
                    </button>
                    <button 
                      onClick={() => updateConfig('petDisplay', 'grid')}
                      className={`py-3 rounded-lg border text-[9px] font-black uppercase tracking-tight transition-all ${config.petDisplay === 'grid' ? 'bg-red-800 text-white border-red-800 shadow-md' : (editorDarkMode ? 'bg-stone-800 text-stone-400 border-stone-700' : 'bg-stone-50 text-stone-500 border-stone-200')}`}
                    >
                      Grid/Rows
                    </button>
                  </div>
                  {config.petDisplay === 'grid' && (
                    <div className="p-3 rounded-xl border border-stone-100/50">
                      <div className="flex justify-between mb-1 text-[9px] font-bold uppercase">
                        <span className="text-stone-400">Columns</span>
                        <span className="text-red-600">{config.petGridCols}</span>
                      </div>
                      <input type="range" min="1" max="10" value={config.petGridCols} onChange={(e) => updateConfig('petGridCols', parseInt(e.target.value))} className="w-full accent-red-800 h-1" />
                    </div>
                  )}
                  <div className="p-3 rounded-xl border border-stone-100/50">
                    <div className="flex justify-between mb-1 text-[9px] font-bold uppercase">
                      <span className="text-stone-400">Pet Image Size</span>
                      <span className="text-red-600">{config.petImageSize || 120}px</span>
                    </div>
                    <input type="range" min="50" max="250" value={config.petImageSize || 120} onChange={(e) => updateConfig('petImageSize', parseInt(e.target.value))} className="w-full accent-red-800 h-1" />
                  </div>
                  <div className={`p-3 rounded-xl border ${editorDarkMode ? 'bg-stone-900 border-stone-800' : 'bg-stone-50 border-stone-100'}`}>
                    <div className="flex justify-between mb-1 text-[9px] font-bold uppercase">
                      <span className={editorDarkMode ? 'text-stone-500' : 'text-stone-400'}>Show Pets (Count)</span>
                      <span className="text-red-600">{config.previewPetCount}</span>
                    </div>
                    <input type="range" min="1" max={Math.max(config.pets.length, 12)} value={config.previewPetCount} onChange={(e) => updateConfig('previewPetCount', parseInt(e.target.value))} className="w-full accent-red-800 h-1" />
                  </div>
                </section>

                <section className="space-y-4 pt-6 border-t border-stone-100/50">
                  <h3 className={`text-[10px] font-black uppercase tracking-widest ${editorDarkMode ? 'text-stone-500' : 'text-stone-400'}`}>Pet Aesthetics</h3>
                  <div className="space-y-4">
                    <ColorSetting label="Border Color" value={config.petBorderColor} onChange={(v) => updateConfig('petBorderColor', v)} darkMode={editorDarkMode} />
                    <ToggleRow label="Hover Scale Effect" checked={config.petHoverScale > 1} onChange={(v) => updateConfig('petHoverScale', v ? 1.1 : 1)} darkMode={editorDarkMode} />
                    <ToggleRow label="Simpler Pet Info" checked={config.hidePetDetails} onChange={(v) => updateConfig('hidePetDetails', v)} darkMode={editorDarkMode} />
                  </div>
                </section>

                <section className="space-y-4 pt-6 border-t border-stone-100/50">
                  <h3 className={`text-[10px] font-black uppercase tracking-widest ${editorDarkMode ? 'text-stone-500' : 'text-stone-400'}`}>Pet Roster</h3>
                  <div className="space-y-3">
                    {config.pets.map((pet, i) => (
                      <div key={i} className={`p-3 rounded-xl border flex gap-3 ${editorDarkMode ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-100'}`}>
                        <div className="w-12 h-12 bg-stone-50 rounded-lg overflow-hidden border border-stone-100">
                          <img src={pet.image || undefined} className="w-full h-full object-cover" alt="" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <input 
                            type="text" 
                            value={pet.name} 
                            onChange={(e) => {
                              const newPets = [...config.pets];
                              newPets[i].name = e.target.value;
                              updateConfig('pets', newPets);
                            }}
                            className={`w-full text-[10px] font-bold bg-transparent border-b border-transparent focus:border-red-800/30 outline-none ${editorDarkMode ? 'text-stone-300' : 'text-stone-700'}`}
                          />
                          <input 
                            type="text" 
                            value={pet.image} 
                            placeholder="Image URL"
                            onChange={(e) => {
                              const newPets = [...config.pets];
                              newPets[i].image = e.target.value;
                              updateConfig('pets', newPets);
                            }}
                            className={`w-full text-[8px] opacity-60 bg-transparent border-b border-transparent focus:border-red-800/20 outline-none ${editorDarkMode ? 'text-stone-500' : 'text-stone-500'}`}
                          />
                        </div>
                        <button 
                          onClick={() => {
                            const newPets = config.pets.filter((_, idx) => idx !== i);
                            updateConfig('pets', newPets);
                          }}
                          className="self-start text-stone-300 hover:text-red-800 transition-colors"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                    <button 
                      onClick={() => updateConfig('pets', [...config.pets, { name: "New Pet", image: PET_IMAGES[0], species: "Species", age: "0", lvl: "1" }])}
                      className={`w-full py-2 border-2 border-dashed rounded-xl text-[9px] font-black uppercase tracking-widest transition-colors ${editorDarkMode ? 'border-stone-800 text-stone-600 hover:bg-stone-900 hover:text-stone-400' : 'border-stone-100 text-stone-400 hover:bg-stone-50 hover:text-red-800'}`}
                    >
                      + Add New Pet
                    </button>
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'content' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                <section className="space-y-4">
                  <div className="group">
                    <label className={`text-[9px] font-black uppercase tracking-widest mb-1.5 flex items-center gap-1.5 ${editorDarkMode ? 'text-stone-500' : 'text-stone-400'}`}>
                      <User size={10} /> Profile Username
                    </label>
                    <input type="text" value={config.username} onChange={(e) => updateConfig('username', e.target.value)} className={`w-full border p-3 text-xs rounded-lg ${editorDarkMode ? 'bg-stone-900 border-stone-800 text-stone-200' : 'bg-stone-50'}`} />
                  </div>

                  <div className="group">
                    <div className="flex items-center justify-between mb-2">
                      <label className={`text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 ${editorDarkMode ? 'text-stone-500' : 'text-stone-400'}`}>
                        <Code size={10} /> Biography Editor
                      </label>
                    </div>
                    
                    <div className="mb-4">
                      <label className="text-[9px] font-bold uppercase block mb-1">Layout Style</label>
                      <select value={config.bioLayout || 'stacked'} onChange={(e) => updateConfig('bioLayout', e.target.value)} className={`w-full p-2 border rounded-lg text-xs ${editorDarkMode ? 'bg-stone-900 border-stone-800 text-stone-200' : 'bg-white'}`}>
                        <option value="stacked">Stacked</option>
                        <option value="side-by-side">Side-by-Side</option>
                        <option value="grid">Grid</option>
                      </select>
                    </div>

                    <BioSectionsEditor 
                      config={config} 
                      updateBioSection={updateBioSection} 
                      removeBioSection={removeBioSection} 
                      addBioSection={addBioSection} 
                      editorDarkMode={editorDarkMode} 
                      totalLength={generatedCSS.length}
                    />
                  </div>
                </section>

                <section className="space-y-4 pt-6 border-t border-stone-100">
                  <h3 className={`text-[10px] font-black uppercase tracking-widest ${editorDarkMode ? 'text-stone-500' : 'text-stone-400'}`}>Navigation Links</h3>
                  <div className="space-y-3">
                    {config.customLinks.map((link, i) => (
                      <div key={i} className={`flex gap-2 items-center p-2 rounded-lg border ${editorDarkMode ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-100'}`}>
                        <input 
                          type="text" value={link.label} placeholder="Label" 
                          onChange={(e) => {
                            const newLinks = [...config.customLinks];
                            newLinks[i].label = e.target.value;
                            updateConfig('customLinks', newLinks);
                          }}
                          className={`w-1/3 text-[9px] font-bold bg-transparent outline-none ${editorDarkMode ? 'text-stone-300' : 'text-stone-700'}`}
                        />
                        <input 
                          type="text" value={link.url} placeholder="/" 
                          onChange={(e) => {
                            const newLinks = [...config.customLinks];
                            newLinks[i].url = e.target.value;
                            updateConfig('customLinks', newLinks);
                          }}
                          className={`flex-1 text-[9px] bg-transparent outline-none ${editorDarkMode ? 'text-stone-500' : 'text-stone-500'}`}
                        />
                        <button onClick={() => updateConfig('customLinks', config.customLinks.filter((_, idx) => idx !== i))} className="text-stone-400 hover:text-red-800 transition-colors"><X size={12} /></button>
                      </div>
                    ))}
                    <button 
                       onClick={() => updateConfig('customLinks', [...config.customLinks, { label: "New Link", url: "/" }])}
                       className={`w-full py-2 border border-dashed rounded-lg text-[9px] font-black uppercase tracking-widest transition-colors ${editorDarkMode ? 'border-stone-800 text-stone-600 hover:bg-stone-900 hover:text-stone-400' : 'border-stone-100 text-stone-400 hover:bg-stone-50 hover:text-red-800'}`}
                    >
                      + Add Navigation Link
                    </button>
                  </div>
                </section>

                <section className="space-y-4 pt-6 border-t border-stone-100">
                  <h3 className={`text-[10px] font-black uppercase tracking-widest ${editorDarkMode ? 'text-stone-500' : 'text-stone-400'}`}>Library Snippets</h3>
                  <div className="grid grid-cols-1 gap-2">
                    <SnippetBtn label="Dashed Divider" icon={<Monitor size={10} />} darkMode={editorDarkMode} onClick={() => appendSnippet('\n<div style="width: 100%; border-bottom: 2px dashed #000; margin: 20px 0;"></div>', 'Divider')} />
                    <SnippetBtn label="Scrolling Info Box" icon={<Check size={10} />} darkMode={editorDarkMode} onClick={() => appendSnippet(`\n<div style="width: 250px; height: 150px; overflow-y: scroll; border: 2px solid #333; padding: 15px; margin: 0 auto; background: #fff;">\n  <h3>SCROLL ME</h3>\n  <p>Long content goes here...</p>\n</div>`, 'Scroll Box')} />
                    <SnippetBtn label="Hero Banner" icon={<ImageIcon size={10} />} darkMode={editorDarkMode} onClick={() => appendSnippet(`\n<div style="width: 100%; height: 200px; background: url('https://images.neopets.com/backgrounds/hero.png') center/cover no-repeat; border-radius: 15px; margin-bottom: 20px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 24px; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">\n  YOUR TITLE HERE\n</div>`, 'Hero Banner')} />
                    <SnippetBtn label="2-Column Layout" icon={<Layout size={10} />} darkMode={editorDarkMode} onClick={() => appendSnippet(`\n<div style="display: table; width: 100%; border-spacing: 15px;">\n  <div style="display: table-cell; width: 50%; background: #f5f5f5; padding: 10px; border-radius: 8px;">Left Content</div>\n  <div style="display: table-cell; width: 50%; background: #f5f5f5; padding: 10px; border-radius: 8px;">Right Content</div>\n</div>`, 'Columns')} />
                    <SnippetBtn label="Styled Textbox" icon={<Type size={10} />} darkMode={editorDarkMode} onClick={() => appendSnippet('\n<div style="background: #f9f9f9; border: 1px solid #ccc; padding: 15px; border-radius: 8px; color: #333;">Your content...</div>', 'Textbox')} />
                    <SnippetBtn label="Custom Link Bar" icon={<Layout size={10} />} darkMode={editorDarkMode} onClick={() => appendSnippet(`\n<div style="text-align: center; margin: 20px 0; font-weight: bold; font-family: Verdana;">\n  <a href="/">HOME</a> | <a href="/neoboards">BOARDS</a> | <a href="/market.phtml">SHOP</a>\n</div>`, 'Links')} />
                    <SnippetBtn label="Gradient Text" icon={<Palette size={10} />} darkMode={editorDarkMode} onClick={() => appendSnippet(`\n<span style="background: linear-gradient(to right, #6366f1, #a855f7); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 800; font-size: 1.5rem;">COOL GRADIENT TEXT</span>`, 'Gradient')} />
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'assets' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
                <section className="space-y-4">
                  <h3 className={`text-[10px] font-black uppercase tracking-widest ${editorDarkMode ? 'text-stone-500' : 'text-stone-400'}`}>Image Overrides</h3>
                  <div className="space-y-3">
                    <UrlInput label="Global BG" value={config.bgImage} onChange={(v) => updateConfig('bgImage', v)} darkMode={editorDarkMode} />
                    <UrlInput label="Shield" value={config.shieldUrl} onChange={(v) => updateConfig('shieldUrl', v)} darkMode={editorDarkMode} />
                    <UrlInput label="Shopkeeper" value={config.shopkeeperUrl} onChange={(v) => updateConfig('shopkeeperUrl', v)} darkMode={editorDarkMode} />
                    <UrlInput label="Gallery Keeper" value={config.galleryKeeperUrl} onChange={(v) => updateConfig('galleryKeeperUrl', v)} darkMode={editorDarkMode} />
                    <UrlInput label="Neohome" value={config.neohomeUrl} onChange={(v) => updateConfig('neohomeUrl', v)} darkMode={editorDarkMode} />
                  </div>
                </section>

                <section className="space-y-4 pt-6 border-t border-stone-100">
                  <h3 className={`text-[10px] font-black uppercase tracking-widest ${editorDarkMode ? 'text-stone-500' : 'text-stone-400'}`}>Floating Anchors</h3>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                       <input 
                         type="text" 
                         placeholder="New Asset URL..." 
                         id="new-asset-url"
                         className={`flex-1 border p-2 text-[10px] rounded-lg outline-none ${editorDarkMode ? 'bg-stone-900 border-stone-800 text-stone-300' : 'bg-stone-50'}`}
                       />
                       <button 
                         onClick={() => {
                           const input = document.getElementById('new-asset-url') as HTMLInputElement;
                           if (!input.value) return;
                           const newAsset = { id: Math.random().toString(36).substr(2, 9), url: input.value, x: 100, y: 100, width: 100 };
                           updateConfig('customAssets', [...config.customAssets, newAsset]);
                           input.value = '';
                         }}
                         className="bg-red-800 text-white px-3 rounded-lg text-[10px] font-black uppercase"
                       >
                         Add
                       </button>
                    </div>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                      {config.customAssets.map((asset, i) => (
                        <div key={asset.id} className={`flex items-center gap-2 p-2 rounded-lg border ${editorDarkMode ? 'bg-stone-900/50 border-stone-800' : 'bg-white border-stone-100 shadow-sm'}`}>
                          <img src={asset.url || undefined} className="w-8 h-8 object-contain bg-stone-100 rounded" alt="" />
                          <div className="flex-1 min-w-0">
                             <p className="text-[8px] font-bold text-stone-400 truncate">{asset.url}</p>
                             <div className="flex gap-2 items-center">
                               <input type="number" value={asset.width} onChange={(e) => {
                                 const newAssets = [...config.customAssets];
                                 newAssets[i].width = parseInt(e.target.value) || 0;
                                 updateConfig('customAssets', newAssets);
                               }} className={`w-12 text-[9px] bg-transparent outline-none font-bold ${editorDarkMode ? 'text-stone-500' : 'text-stone-600'}`} />
                               <span className="text-[8px] text-stone-400 font-bold uppercase tracking-tighter">px width</span>
                             </div>
                          </div>
                          <button 
                            onClick={() => {
                              const newAssets = config.customAssets.filter((_, idx) => idx !== i);
                              updateConfig('customAssets', newAssets);
                            }}
                            className="p-1.5 hover:text-red-800 transition-colors"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              </div>
            )}
          </div>
        </div>

        <div className={`p-6 border-t bg-stone-50 space-y-3 transition-colors ${editorDarkMode ? 'bg-stone-900 border-stone-800' : 'bg-stone-50 border-stone-200'}`}>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setShowCode(true)} className="w-full bg-red-800 hover:bg-red-700 active:scale-95 text-white py-4 rounded font-black uppercase tracking-widest text-[10px] shadow-xl shadow-red-800/20 hover:shadow-[0_0_20px_rgba(153,27,27,0.6)] transition-all duration-300 flex flex-col items-center justify-center gap-1 group">
              <Code size={13} strokeWidth={3} className="group-hover:scale-110 transition-transform duration-300" /> Export Style
            </button>
            <button onClick={() => setShowFilterCheck(true)} className="w-full bg-emerald-700 hover:bg-emerald-600 active:scale-95 text-white py-4 rounded font-black uppercase tracking-widest text-[10px] shadow-xl shadow-emerald-700/20 hover:shadow-[0_0_20px_rgba(4,120,87,0.6)] transition-all duration-300 flex flex-col items-center justify-center gap-1 group">
              <Shield size={13} strokeWidth={3} className="group-hover:scale-110 transition-transform duration-300" /> Filter Check
            </button>
          </div>
          <button onClick={() => { setConfig(DEFAULT_CONFIG); toast.success('Factory reset complete', { description: 'All settings have been restored to defaults.' }); }} className={`w-full text-[9px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-1.5 transition-colors pt-2 ${editorDarkMode ? 'text-stone-600 hover:text-red-500' : 'text-stone-400 hover:text-red-800'}`}><RotateCcw size={10} strokeWidth={3} /> Factory Reset</button>
        </div>
        </div>
        </div>
      </motion.aside>

      {/* Minimized Overlay Icons (when sidebar is slim) */}
      {isSidebarMinimized && (
        <div className="fixed left-0 top-16 bottom-20 w-10 flex flex-col items-center py-8 gap-6 z-30 pointer-events-none">
           <EditorTooltip text="Master Settings">
             <button 
               onClick={() => setShowSettings(true)} 
               className="text-stone-400 hover:text-red-800 transition-colors pointer-events-auto" 
             >
               <Settings size={14} />
             </button>
           </EditorTooltip>
           <div className="h-px w-2 bg-stone-300 pointer-events-none" />
           <EditorTooltip text="Export Styles">
             <button 
               onClick={() => setShowCode(true)} 
               className="text-red-800 hover:scale-110 transition-transform pointer-events-auto"
             >
               <Code size={18} strokeWidth={3} />
             </button>
           </EditorTooltip>
           <EditorTooltip text="Factory Reset">
             <button 
               onClick={() => { setConfig(DEFAULT_CONFIG); toast.success('Factory reset complete'); }} 
               className="text-stone-400 hover:text-red-800 transition-colors pointer-events-auto"
             >
               <RotateCcw size={14} />
             </button>
           </EditorTooltip>
        </div>
      )}

      <main className="flex-1 overflow-auto bg-stone-200/50 p-12 flex flex-col items-center relative custom-scrollbar">
        <AnimatePresence>
          {showSettings && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-[2px] px-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 10 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className={`w-full max-w-md max-h-[80vh] flex flex-col rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border relative overflow-hidden ${themeColors.bg} ${themeColors.border}`}
              >
                 <div className={`p-5 border-b sticky top-0 z-10 flex items-center justify-between ${themeColors.secondary} ${themeColors.border}`}>
                    <div>
                      <h2 className="text-[11px] font-black uppercase tracking-widest text-red-800">Master Settings</h2>
                      <p className="text-[8px] font-bold text-stone-400 uppercase tracking-widest">Editor & Importer</p>
                    </div>
                    <button onClick={() => setShowSettings(false)} className="p-1.5 hover:bg-red-800/10 rounded-full text-stone-400 hover:text-red-800 transition-colors">
                      <X size={16} />
                    </button>
                 </div>
                 
                 <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                   <section className="space-y-4">
                    <h3 className={`text-[9px] font-black uppercase tracking-widest flex items-center gap-2 ${editorDarkMode ? 'text-stone-500' : 'text-stone-400'}`}>
                      <Palette size={10} /> Editor Aesthetics
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {(Object.keys(EDITOR_THEMES) as EditorTheme[]).map(t => (
                        <button
                          key={t}
                          onClick={() => setEditorTheme(t)}
                          className={`py-2.5 px-3 rounded-xl border text-[9px] font-black uppercase tracking-tight transition-all text-left flex items-center justify-between ${editorTheme === t ? 'ring-2 ring-red-800 border-red-800 bg-red-50/10' : 'border-stone-200 hover:border-stone-400 shadow-sm'}`}
                        >
                          <span>{EDITOR_THEMES[t].label}</span>
                          <div className={`w-3.5 h-3.5 rounded-full ${EDITOR_THEMES[t].bg} border border-stone-200 shadow-inner`} />
                        </button>
                      ))}
                    </div>
                    <div className={`p-1 rounded-xl border ${themeColors.secondary} ${themeColors.border}`}>
                      <ToggleRow 
                        label="Quick Dark Mode" 
                        description="Invert editor colors for night-time working."
                        checked={editorDarkMode} 
                        onChange={setEditorDarkMode} 
                        darkMode={editorDarkMode} 
                      />
                    </div>
                  </section>

                  <section className="space-y-4 pt-6 border-t border-stone-100">
                    <h3 className={`text-[9px] font-black uppercase tracking-widest flex items-center gap-2 ${editorDarkMode ? 'text-stone-500' : 'text-stone-400'}`}>
                      <Wand2 size={10} /> Profile Importer
                    </h3>
                    <div className={`${editorDarkMode ? 'bg-stone-900 border-stone-800 shadow-inner' : 'bg-blue-50/50 border-blue-100'} p-4 rounded-xl border space-y-3`}>
                      <textarea
                        placeholder="Paste Lookup Page Source (Ctrl+U) here..."
                        value={importHtml}
                        onChange={(e) => setImportHtml(e.target.value)}
                        className={`w-full h-24 text-[9px] font-mono p-3 rounded-lg border outline-none resize-none shadow-inner transition-all focus:ring-2 focus:ring-blue-500/20 ${editorDarkMode ? 'bg-stone-950 border-stone-800 text-stone-500' : 'bg-white border-blue-200 text-stone-600'}`}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            const parsed = parseProfileHtml(importHtml);
                            if (Object.keys(parsed).length > 0) {
                              setConfig(prev => ({ ...prev, ...parsed }));
                              setImportHtml('');
                              toast.success('Profile imported automatically!', { description: 'Your Neopets data was successfully synced.' });
                            } else if (importHtml.trim()) {
                              toast.error('No profile data found.', { description: "Make sure you're pasting the full page source (Ctrl+U) of your User Lookup." });
                            }
                          }}
                          className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20 active:scale-95 flex items-center justify-center gap-2"
                        >
                          <Wand2 size={10} /> Sync Everything
                        </button>
                        <button 
                          onClick={() => setImportHtml('')} 
                          className={`p-2.5 border rounded-lg transition-colors ${editorDarkMode ? 'border-stone-800 text-stone-600 hover:text-red-800' : 'border-stone-200 text-stone-400 hover:text-red-800 bg-white shadow-sm'}`}
                          title="Clear Input"
                        >
                          <RotateCcw size={12} />
                        </button>
                      </div>
                      {showImportSuccess && (
                        <motion.p 
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="text-[9px] text-green-600 font-black text-center uppercase tracking-[0.2em]"
                        >
                          Imported!
                        </motion.p>
                      )}
                    </div>
                  </section>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <div 
          className="shrink-0 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] transition-all duration-500 bg-white group/preview overflow-hidden border border-stone-300 relative flex"
          style={{ 
            width: `${config.mainWidth}px`, 
            marginTop: `${config.mainMarginTop}px`,
            marginLeft: config.mainMarginLeft ? `${config.mainMarginLeft}px` : '0',
            cursor: config.cursor === 'neopets' ? 'url(https://images.neopets.com/images/cursor.gif), auto' : config.cursor
          }}
        >
          <div className="flex-1 overflow-hidden">
            <LookupPreview 
              config={config} 
              onEditPart={(tab) => setEditingPart(tab)} 
              updateConfig={updateConfig} 
              dragMode={dragMode}
              appendSnippet={appendSnippet}
            />
          </div>
        </div>
      </main>

      {/* Contextual Editor Modal */}
      <AnimatePresence>
        {editingPart && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className={`w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border ${editorDarkMode ? 'bg-stone-950 border-stone-800' : 'bg-white border-stone-200'}`}
            >
              <div className={`px-6 py-4 border-b flex items-center justify-between ${editorDarkMode ? 'bg-stone-900/50 border-stone-800' : 'bg-stone-50 border-stone-100'}`}>
                <div className="flex items-center gap-3">
                  <div className="bg-red-800 p-2 rounded-lg text-white">
                    {editingPart === 'style' && <Palette size={16} />}
                    {editingPart === 'layout' && <Layout size={16} />}
                    {editingPart === 'pets' && <Star size={16} />}
                    {editingPart === 'content' && <Type size={16} />}
                    {editingPart === 'images' && <ImageIcon size={16} />}
                  </div>
                  <div>
                    <h2 className={`text-sm font-black uppercase tracking-tight ${editorDarkMode ? 'text-stone-200' : 'text-stone-900'}`}>{editingPart} Settings</h2>
                    <p className="text-[10px] text-stone-500 font-bold uppercase">Customize this section</p>
                  </div>
                </div>
                <button 
                  onClick={() => setEditingPart(null)} 
                  className={`p-2 rounded-full hover:bg-stone-200 transition-colors ${editorDarkMode ? 'text-stone-400 hover:bg-stone-800' : 'text-stone-500'}`}
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-6 max-h-[70vh] overflow-y-auto scrollbar-thin">
                {editingPart === 'style' && (
                  <div className="space-y-6">
                    <section className="space-y-4">
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-stone-400">Typography & Text</h3>
                      <div className="space-y-6">
                        <div className="space-y-3">
                           <FontSelect label="Global Body Font" value={config.fontFamily} onChange={(v) => updateConfig('fontFamily', v)} darkMode={editorDarkMode} />
                           <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold uppercase block opacity-60">Global Size</label>
                                <input type="number" value={config.fontSize} onChange={(e) => updateConfig('fontSize', parseInt(e.target.value))} className="w-full p-1.5 border rounded text-xs" />
                              </div>
                              <ColorSetting label="Global Color" value={config.textColor} onChange={(v) => updateConfig('textColor', v)} darkMode={editorDarkMode} />
                           </div>
                        </div>

                        <div className="space-y-3 pt-4 border-t border-stone-100">
                           <FontSelect label="Site Header Font" value={config.headerFont} onChange={(v) => updateConfig('headerFont', v)} darkMode={editorDarkMode} />
                           <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold uppercase block opacity-60">Header Size</label>
                                <input type="number" value={config.headerFontSize} onChange={(e) => updateConfig('headerFontSize', parseInt(e.target.value))} className="w-full p-1.5 border rounded text-xs" />
                              </div>
                              <ColorSetting label="Header Color" value={config.headerTextColor} onChange={(v) => updateConfig('headerTextColor', v)} darkMode={editorDarkMode} />
                           </div>
                        </div>

                        <div className="space-y-3 pt-4 border-t border-stone-100">
                           <FontSelect label="Module Header Font" value={config.moduleFont} onChange={(v) => updateConfig('moduleFont', v)} darkMode={editorDarkMode} />
                           <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold uppercase block opacity-60">Module Size</label>
                                <input type="number" value={config.moduleFontSize} onChange={(e) => updateConfig('moduleFontSize', parseInt(e.target.value))} className="w-full p-1.5 border rounded text-xs" />
                              </div>
                              <ColorSetting label="Header text" value={config.moduleHeaderText} onChange={(v) => updateConfig('moduleHeaderText', v)} darkMode={editorDarkMode} />
                           </div>
                        </div>
                      </div>
                    </section>
                    <section className="space-y-4 pt-6 border-t border-stone-100">
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-stone-400">Background & Assets</h3>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <ColorSetting label="Page BG" value={config.bgColor} onChange={(v) => updateConfig('bgColor', v)} darkMode={editorDarkMode} />
                          <ColorSetting label="Link Color" value={config.linkColor} onChange={(v) => updateConfig('linkColor', v)} darkMode={editorDarkMode} />
                          <ColorSetting label="Header BG" value={config.moduleHeaderBg} onChange={(v) => updateConfig('moduleHeaderBg', v)} darkMode={editorDarkMode} />
                          <ColorSetting label="Content BG" value={config.moduleContentBg} onChange={(v) => updateConfig('moduleContentBg', v)} darkMode={editorDarkMode} />
                          <ColorSetting label="Border Color" value={config.moduleBorder} onChange={(v) => updateConfig('moduleBorder', v)} darkMode={editorDarkMode} />
                          <ColorSetting label="User Color" value={config.userGenderColor} onChange={(v) => updateConfig('userGenderColor', v)} darkMode={editorDarkMode} />
                        </div>
                        
                        <div className="space-y-1.5">
                           <label className="text-[9px] font-bold uppercase flex items-center gap-2">
                             Background Image URL
                             <ImageIcon size={10} />
                           </label>
                           <input 
                             type="text" 
                             value={config.bgImage} 
                             onChange={(e) => updateConfig('bgImage', e.target.value)} 
                             className={`w-full p-2 border rounded-lg text-xs font-mono focus:ring-1 focus:ring-red-800 focus:outline-none ${editorDarkMode ? 'bg-stone-900 border-stone-800' : 'bg-stone-50'}`} 
                             placeholder="https://..."
                           />
                        </div>

                        {config.bgImage && (
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <div className="space-y-1">
                              <label className="text-[8px] font-bold uppercase text-stone-500">Attachment</label>
                              <select 
                                value={config.bgAttachment} 
                                onChange={(e) => updateConfig('bgAttachment', e.target.value as 'scroll' | 'fixed')}
                                className={`w-full p-2 border rounded text-xs focus:ring-1 focus:ring-red-800 focus:outline-none ${editorDarkMode ? 'bg-stone-900 border-stone-800 text-stone-300' : 'bg-white text-stone-700'}`}
                              >
                                <option value="scroll">Scroll</option>
                                <option value="fixed">Fixed (Locked)</option>
                              </select>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[8px] font-bold uppercase text-stone-500">Position</label>
                              <select 
                                value={config.bgPosition} 
                                onChange={(e) => updateConfig('bgPosition', e.target.value)}
                                className={`w-full p-2 border rounded text-xs focus:ring-1 focus:ring-red-800 focus:outline-none ${editorDarkMode ? 'bg-stone-900 border-stone-800 text-stone-300' : 'bg-white text-stone-700'}`}
                              >
                                <option value="center">Center</option>
                                <option value="top left">Top Left</option>
                                <option value="top right">Top Right</option>
                                <option value="bottom left">Bottom Left</option>
                                <option value="bottom right">Bottom Right</option>
                                <option value="top center">Top Center</option>
                                <option value="bottom center">Bottom Center</option>
                              </select>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[8px] font-bold uppercase text-stone-500">Repeat</label>
                              <select 
                                value={config.bgRepeat} 
                                onChange={(e) => updateConfig('bgRepeat', e.target.value)}
                                className={`w-full p-2 border rounded text-xs focus:ring-1 focus:ring-red-800 focus:outline-none ${editorDarkMode ? 'bg-stone-900 border-stone-800 text-stone-300' : 'bg-white text-stone-700'}`}
                              >
                                <option value="repeat">Repeat</option>
                                <option value="no-repeat">No Repeat</option>
                                <option value="repeat-x">Repeat X</option>
                                <option value="repeat-y">Repeat Y</option>
                                <option value="space">Space</option>
                                <option value="round">Round</option>
                              </select>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[8px] font-bold uppercase text-stone-500">Size</label>
                              <select 
                                value={config.bgSize} 
                                onChange={(e) => updateConfig('bgSize', e.target.value)}
                                className={`w-full p-2 border rounded text-xs focus:ring-1 focus:ring-red-800 focus:outline-none ${editorDarkMode ? 'bg-stone-900 border-stone-800 text-stone-300' : 'bg-white text-stone-700'}`}
                              >
                                <option value="auto">Auto</option>
                                <option value="cover">Cover</option>
                                <option value="contain">Contain</option>
                                <option value="100% 100%">Stretch</option>
                                <option value="100% auto">Fit Width</option>
                                <option value="auto 100%">Fit Height</option>
                              </select>
                            </div>
                          </div>
                        )}

                      </div>
                    </section>
                  </div>
                )}
                
                {editingPart === 'layout' && (
                  <div className="space-y-6">
                    <section className="space-y-4">
                       <h3 className="text-[10px] font-black uppercase tracking-widest text-stone-400">Positioning</h3>
                       <div className="rounded-xl border border-blue-200 bg-blue-50/50">
                         <ToggleRow 
                           label="Drag to Position Elements" 
                           description="Move things around inside the preview to build a custom look."
                           checked={dragMode} 
                           onChange={(v) => {
                             setDragMode(v);
                             if (v) {
                               toast.info('Drag Mode Active', { description: 'Close this modal and drag elements around the preview.' });
                             }
                           }}
                           darkMode={editorDarkMode} 
                         />
                       </div>
                    </section>

                    <section className="space-y-4 pt-6 border-t border-stone-100">
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-stone-400">Visibility</h3>
                      <div className="space-y-2">
                        <ToggleRow label="Hide Header" checked={config.hideHeader} onChange={(v) => updateConfig('hideHeader', v)} darkMode={editorDarkMode} />
                        <ToggleRow label="Hide Footer" checked={config.hideFooter} onChange={(v) => updateConfig('hideFooter', v)} darkMode={editorDarkMode} />
                        <ToggleRow label="Hide Trophies" checked={config.hideTrophies} onChange={(v) => updateConfig('hideTrophies', v)} darkMode={editorDarkMode} />
                        <ToggleRow label="Hide Shop" checked={config.hideShop} onChange={(v) => updateConfig('hideShop', v)} darkMode={editorDarkMode} />
                      </div>
                    </section>
                    <div className="pt-4 grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[9px] font-bold uppercase block mb-1">Corner Radius</label>
                        <input type="number" value={config.moduleBorderRadius} onChange={(e) => updateConfig('moduleBorderRadius', parseInt(e.target.value))} className="w-full p-2 border rounded-lg text-xs" />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold uppercase block mb-1">Pet Corner Radius</label>
                        <input type="number" value={config.petBorderRadius} onChange={(e) => updateConfig('petBorderRadius', parseInt(e.target.value))} className="w-full p-2 border rounded-lg text-xs" />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold uppercase block mb-1">Border Size</label>
                        <input type="number" value={config.moduleBorderSize} onChange={(e) => updateConfig('moduleBorderSize', parseInt(e.target.value))} className="w-full p-2 border rounded-lg text-xs" />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold uppercase block mb-1">Pet Border Size</label>
                        <input type="number" value={config.petBorderSize} onChange={(e) => updateConfig('petBorderSize', parseInt(e.target.value))} className="w-full p-2 border rounded-lg text-xs" />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold uppercase block mb-1">Padding</label>
                        <input type="number" value={config.modulePadding} onChange={(e) => updateConfig('modulePadding', parseInt(e.target.value))} className="w-full p-2 border rounded-lg text-xs" />
                      </div>
                    </div>
                  </div>
                )}

                {editingPart === 'pets' && (
                  <div className="space-y-6">
                    <section className="space-y-4">
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-stone-400">Display</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-bold uppercase">Layout Style</label>
                          <select value={config.petDisplay} onChange={(e) => updateConfig('petDisplay', e.target.value)} className="w-full p-2 border rounded-lg text-xs">
                            <option value="carousel">Carousel</option>
                            <option value="grid">Grid</option>
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-bold uppercase">Visible Count</label>
                          <input type="number" value={config.previewPetCount} onChange={(e) => updateConfig('previewPetCount', parseInt(e.target.value))} className="w-full p-2 border rounded-lg text-xs" />
                        </div>
                      </div>
                    </section>
                    <section className="space-y-4 pt-6 border-t border-stone-100">
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-stone-400">Pet Appearance</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[9px] font-bold uppercase block mb-1">Corner Radius</label>
                          <input type="number" value={config.petBorderRadius} onChange={(e) => updateConfig('petBorderRadius', parseInt(e.target.value) || 0)} className={`w-full p-2 border rounded-lg text-xs ${editorDarkMode ? 'bg-stone-900 border-stone-800 text-stone-300' : 'bg-white'}`} />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold uppercase block mb-1">Border Size</label>
                          <input type="number" value={config.petBorderSize} onChange={(e) => updateConfig('petBorderSize', parseInt(e.target.value) || 0)} className={`w-full p-2 border rounded-lg text-xs ${editorDarkMode ? 'bg-stone-900 border-stone-800 text-stone-300' : 'bg-white'}`} />
                        </div>
                        <ColorSetting label="Border Color" value={config.petBorderColor} onChange={(v) => updateConfig('petBorderColor', v)} darkMode={editorDarkMode} />
                        <ColorSetting label="Pet Gender Color" value={config.petGenderColor} onChange={(v) => updateConfig('petGenderColor', v)} darkMode={editorDarkMode} />
                        <div>
                          <label className="text-[9px] font-bold uppercase block mb-1">Hover Scale</label>
                          <input type="number" step="0.05" value={config.petHoverScale} onChange={(e) => updateConfig('petHoverScale', parseFloat(e.target.value))} className="w-full p-2 border rounded-lg text-xs" />
                        </div>
                      </div>
                    </section>
                  </div>
                )}

                {editingPart === 'content' && (
                  <div className="space-y-6">
                    <section className="space-y-4">
                      <div className="flex items-center justify-between mb-2 mt-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Biography Editor</label>
                      </div>
                      
                      <div className="mb-4">
                        <label className="text-[9px] font-bold uppercase block mb-1">Layout Style</label>
                        <select value={config.bioLayout || 'stacked'} onChange={(e) => updateConfig('bioLayout', e.target.value)} className={`w-full p-2 border rounded-lg text-xs ${editorDarkMode ? 'bg-stone-900 border-stone-800 text-stone-200' : 'bg-white'}`}>
                          <option value="stacked">Stacked</option>
                          <option value="side-by-side">Side-by-Side</option>
                          <option value="grid">Grid</option>
                        </select>
                      </div>

                      <BioSectionsEditor 
                        config={config} 
                        updateBioSection={updateBioSection} 
                        removeBioSection={removeBioSection} 
                        addBioSection={addBioSection} 
                        editorDarkMode={editorDarkMode} 
                        totalLength={generatedCSS.length}
                      />
                    </section>
                    <section className="space-y-4 pt-6 border-t border-stone-100">
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-stone-400">Library Snippets</h3>
                      <div className="grid grid-cols-2 gap-2">
                        <SnippetBtn label="Dashed Divider" icon={<Monitor size={10} />} darkMode={editorDarkMode} onClick={() => appendSnippet('\n<div style="width: 100%; border-bottom: 2px dashed #000; margin: 20px 0;"></div>', 'Divider')} />
                        <SnippetBtn label="Gradient Text" icon={<Palette size={10} />} darkMode={editorDarkMode} onClick={() => appendSnippet(`\n<span style="background: linear-gradient(to right, #6366f1, #a855f7); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 800; font-size: 1.5rem;">COOL GRADIENT TEXT</span>`, 'Gradient')} />
                        <SnippetBtn label="Gradient Header" icon={<Palette size={10} />} darkMode={editorDarkMode} onClick={() => appendSnippet(`\n<div style="background: linear-gradient(to right, #822E2E, #f43f5e); color: white; padding: 10px; border-radius: 8px; font-weight: 900; text-align: center; margin: 10px 0;">SECTION HEADER</div>`, 'Header')} />
                        <SnippetBtn label="Solid Divider" icon={<Minus size={10} />} darkMode={editorDarkMode} onClick={() => appendSnippet('\n<div style="width: 100%; border-bottom: 2px solid #ccc; margin: 20px 0;"></div>', 'Divider')} />
                      </div>
                    </section>
                  </div>
                )}

                {editingPart === 'images' && (
                  <div className="space-y-6">
                    <section className="space-y-4">
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-stone-400">Image Overrides</h3>
                      <div className="space-y-3">
                        <UrlInput label="Global BG" value={config.bgImage} onChange={(v) => updateConfig('bgImage', v)} darkMode={editorDarkMode} />
                        <UrlInput label="Shield" value={config.shieldUrl} onChange={(v) => updateConfig('shieldUrl', v)} darkMode={editorDarkMode} />
                        <UrlInput label="Shopkeeper" value={config.shopkeeperUrl} onChange={(v) => updateConfig('shopkeeperUrl', v)} darkMode={editorDarkMode} />
                        <UrlInput label="Gallery Keeper" value={config.galleryKeeperUrl} onChange={(v) => updateConfig('galleryKeeperUrl', v)} darkMode={editorDarkMode} />
                        <UrlInput label="Neohome Image" value={config.neohomeUrl} onChange={(v) => updateConfig('neohomeUrl', v)} darkMode={editorDarkMode} />
                      </div>
                    </section>
                  </div>
                )}
              </div>

              <div className={`px-6 py-4 border-t flex justify-end gap-3 ${editorDarkMode ? 'bg-stone-900/50 border-stone-800' : 'bg-stone-50 border-stone-100'}`}>
                <button 
                   onClick={() => setEditingPart(null)}
                   className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${editorDarkMode ? 'bg-stone-800 text-stone-400 hover:bg-stone-700' : 'bg-stone-200 text-stone-600 hover:bg-stone-300'}`}
                >
                  Done
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Code Export Modal */}
      <AnimatePresence>
        {showCode && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-black/70 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="bg-white w-full max-w-2xl rounded-2xl shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden border border-white/20"
            >
              <div className="px-8 py-6 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
                <div className="flex items-center gap-4">
                  <div className="bg-red-800 p-2.5 rounded-xl shadow-lg"><Code className="text-white w-5 h-5" /></div>
                  <div>
                    <h2 className="text-sm font-black uppercase tracking-tight text-red-950">Live Code Editor</h2>
                    <p className="text-[10px] text-stone-500 font-bold uppercase tracking-widest">Editing this code updates the lookup live</p>
                  </div>
                  <div className="ml-8 px-3 py-1.5 rounded-lg border flex items-center gap-4">
                    <label className="flex items-center gap-1.5 cursor-pointer group">
                      <input type="checkbox" className="hidden" checked={minifyCode} onChange={(e) => setMinifyCode(e.target.checked)} />
                      <div className={`w-6 h-3 rounded-full relative transition-colors ${minifyCode ? 'bg-red-800' : 'bg-stone-300'}`}>
                        <div className={`absolute top-0.5 left-0.5 w-2 h-2 rounded-full bg-white transition-transform ${minifyCode ? 'translate-x-3' : 'translate-x-0'}`} />
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-stone-500 group-hover:text-stone-700">Minify</span>
                    </label>
                    <div className="h-3 w-px bg-stone-200" />
                    <div className="flex items-center gap-2">
                       <span className="text-[9px] font-black uppercase tracking-widest text-stone-500">Char Limit:</span>
                       <span className={`text-xs font-mono font-bold ${editableCode.length > 5000 ? 'text-red-600' : 'text-green-600'}`}>
                         {editableCode.length} / 5000
                       </span>
                    </div>
                    {editableCode.length > 5000 && (
                       <span className="text-[9px] font-bold text-red-500 ml-2 uppercase">(May exceed Neopets limits!)</span>
                    )}
                  </div>
                </div>
                <button onClick={() => setShowCode(false)} className="bg-stone-200 hover:bg-stone-300 text-stone-600 w-8 h-8 rounded-full flex items-center justify-center transition-all">✕</button>
              </div>
              <div className="p-8 space-y-6 bg-white">
                <div className="relative group">
                  <textarea 
                    value={editableCode}
                    onChange={(e) => onManualCodeChange(e.target.value)}
                    className="w-full bg-stone-950 p-8 rounded-xl font-mono text-[10px] text-red-400 max-h-[350px] overflow-auto border border-stone-800 shadow-2xl h-[350px] leading-relaxed scrollbar-thin scrollbar-thumb-stone-800 whitespace-pre-wrap resize-none focus:ring-2 focus:ring-red-900/50 outline-none"
                  />
                  <button 
                    onClick={() => { navigator.clipboard.writeText(editableCode); toast.success('Copied to clipboard!', { description: 'Paste this into your Neopets profile description field.' }); }} 
                    className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white border border-white/10 px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest backdrop-blur-lg transition-all active:scale-95"
                  >
                    <Copy size={12} className="inline mr-2 stroke-[3px]" />
                    Copy Code
                  </button>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-stone-50 p-4 rounded-xl text-center">
                    <p className="text-[10px] font-black uppercase text-red-900 mb-1">Step 1</p>
                    <p className="text-[8px] font-bold text-stone-500 uppercase">Copy All Code</p>
                  </div>
                  <div className="bg-stone-50 p-4 rounded-xl text-center">
                    <p className="text-[10px] font-black uppercase text-red-900 mb-1">Step 2</p>
                    <p className="text-[8px] font-bold text-stone-500 uppercase">Edit Neo Profile</p>
                  </div>
                  <div className="bg-stone-50 p-4 rounded-xl text-center">
                    <p className="text-[10px] font-black uppercase text-red-900 mb-1">Step 3</p>
                    <p className="text-[8px] font-bold text-stone-500 uppercase">Paste in 'About'</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showFilterCheck && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-black/70 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="bg-white w-full max-w-xl rounded-2xl shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden border border-white/20"
            >
              <div className="px-8 py-6 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
                <div className="flex items-center gap-4">
                  <div className="bg-emerald-700 p-2.5 rounded-xl shadow-lg"><ShieldCheck className="text-white w-5 h-5" /></div>
                  <div>
                    <h2 className="text-sm font-black uppercase tracking-tight text-emerald-950">Neopets Filter Safe Check</h2>
                    <p className="text-[10px] text-stone-500 font-bold uppercase tracking-widest">Validating CSS against strict rules</p>
                  </div>
                </div>
                <button onClick={() => setShowFilterCheck(false)} className="bg-stone-200 hover:bg-stone-300 text-stone-600 w-8 h-8 rounded-full flex items-center justify-center transition-all">✕</button>
              </div>
              <div className="p-8 space-y-4 max-h-[60vh] overflow-y-auto">
                {filterWarnings.length === 0 ? (
                   <div className="flex flex-col items-center justify-center py-12 text-center text-emerald-700">
                     <ShieldCheck size={48} className="mb-4 opacity-50" />
                     <p className="font-black text-xl mb-2">Lookin' Good!</p>
                     <p className="text-[12px] font-mono opacity-80">No known strict filter issues found.</p>
                   </div>
                ) : (
                   filterWarnings.map((w, i) => (
                      <div key={i} className={`p-4 rounded-xl border flex gap-4 items-start ${w.type === 'error' ? 'bg-red-50 border-red-200 text-red-900' : w.type === 'warning' ? 'bg-orange-50 border-orange-200 text-orange-900' : 'bg-blue-50 border-blue-200 text-blue-900'}`}>
                         <div className="mt-0.5">
                            {w.type === 'error' ? <AlertTriangle size={16} /> : w.type === 'warning' ? <Info size={16} /> : <Check size={16} />}
                         </div>
                         <div className="text-xs font-mono leading-relaxed">
                            {w.message}
                         </div>
                      </div>
                   ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <Toaster position="bottom-right" />
    </div>
  );
}

function EditorTag({ label, onClick, darkMode, title }: { label: string, onClick: () => void, darkMode: boolean, title?: string }) {
  return (
    <button 
      onClick={onClick}
      title={title}
      className={`px-2 py-0.5 rounded text-[9px] font-black uppercase transition-all duration-300 backdrop-blur-md ${darkMode ? 'bg-stone-800/80 text-stone-300 hover:bg-stone-700/90 hover:text-white hover:border-red-500/50 hover:shadow-[0_0_10px_rgba(239,68,68,0.2)] border border-stone-700/50 shadow-sm shadow-black/20' : 'bg-white/80 text-stone-500 hover:bg-red-800 hover:text-white border border-stone-200/60 shadow-sm shadow-stone-200/50 hover:shadow-[0_0_10px_rgba(153,27,27,0.3)]'}`}
    >
      {label}
    </button>
  );
}

function TabBtn({ active, onClick, label, icon: Icon, darkMode }: { active: boolean, onClick: () => void, label: string, icon?: React.ElementType, darkMode?: boolean }) {
  return (
    <button 
      onClick={onClick} 
      className={`w-full group text-left p-2.5 rounded-xl flex flex-col items-center justify-center gap-2 transition-all duration-300 outline-none border border-transparent hover:shadow-[0_0_15px_rgba(220,38,38,0.2)] ${active ? `${darkMode ? 'bg-stone-800 text-stone-100 border-stone-700 shadow-[0_4px_12px_rgba(0,0,0,0.5)] shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'bg-white text-stone-900 shadow-md border-stone-200 shadow-[0_0_15px_rgba(220,38,38,0.15)]'}` : `${darkMode ? 'text-stone-500 hover:text-stone-300 hover:bg-stone-800/50' : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100'}`}`}
    >
      {Icon && <Icon size={18} className={`transition-all duration-300 ${active ? (darkMode ? 'text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.5)]' : 'text-red-700 drop-shadow-[0_0_8px_rgba(185,28,28,0.3)]') : 'opacity-70 group-hover:scale-110 group-hover:text-red-500'}`} />}
      <span className="text-[9px] font-black uppercase tracking-widest text-center">{label}</span>
    </button>
  );
}

function SnippetBtn({ label, icon, onClick, darkMode }: { label: string, icon: React.ReactNode, onClick: () => void, darkMode: boolean }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 text-left group backdrop-blur-md shadow-inner ${darkMode ? 'bg-stone-900/50 border-stone-800/50 text-stone-300 hover:bg-stone-800/60 hover:border-red-900/50 hover:shadow-[0_0_15px_rgba(239,68,68,0.15)]' : 'bg-white/60 border-stone-200/50 text-stone-700 hover:bg-white hover:border-red-300 hover:shadow-[0_0_15px_rgba(220,38,38,0.15)]'}`}
    >
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${darkMode ? 'bg-stone-800 text-stone-500 group-hover:bg-red-900 group-hover:text-white group-hover:shadow-[0_0_10px_rgba(248,113,113,0.5)]' : 'bg-stone-100 text-stone-400 group-hover:bg-red-100 group-hover:text-red-800 group-hover:shadow-[0_0_10px_rgba(220,38,38,0.3)]'}`}>
        {icon}
      </div>
      <span className="text-[10px] font-black uppercase tracking-tight">{label}</span>
    </button>
  );
}

function ColorSetting({ label, value, onChange, darkMode }: { label: string, value: string, onChange: (v: string) => void, darkMode?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="space-y-1.5 flex-1 relative">
      <label className={`text-[9px] font-black uppercase tracking-tighter ml-0.5 ${darkMode ? 'text-stone-600' : 'text-stone-500'}`}>{label}</label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center gap-2 p-1.5 rounded-xl border text-left transition-all duration-300 backdrop-blur-md shadow-inner group ${darkMode ? 'bg-stone-900/50 border-stone-800/50 hover:bg-stone-800/60 hover:shadow-[0_0_15px_rgba(239,68,68,0.15)] hover:border-red-900/50' : 'bg-white/60 border-stone-200/50 hover:bg-white hover:shadow-[0_0_15px_rgba(220,38,38,0.15)] hover:border-red-300'}`}
        >
          <div 
            className="w-7 h-7 rounded shadow-inner shrink-0 border border-stone-200/20 group-hover:scale-105 transition-transform duration-300" 
            style={{ backgroundColor: value }} 
          />
          <span className={`text-[10px] font-mono transition-colors duration-300 ${darkMode ? 'text-stone-300 group-hover:text-red-400' : 'text-stone-600 group-hover:text-red-700'}`}>{value.toUpperCase()}</span>
        </button>

        {isOpen && mounted && createPortal(
          <div className="fixed inset-0 flex items-center justify-center" style={{ zIndex: 999999 }}>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-[4px]" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className={`relative z-[1000000] p-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border ${darkMode ? 'bg-stone-950 border-stone-800' : 'bg-white border-stone-200'}`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`text-[11px] font-black uppercase tracking-widest ${darkMode ? 'text-stone-400' : 'text-stone-500'}`}>{label}</span>
                <button 
                  type="button"
                  onClick={() => setIsOpen(false)} 
                  className="text-stone-400 hover:text-red-500 transition-colors p-1 bg-stone-100/50 hover:bg-red-50 rounded-full"
                >
                  <X size={12} />
                </button>
              </div>
              <HexColorPicker color={value} onChange={onChange} />
              <div className={`mt-4 pt-3 border-t flex gap-2 ${darkMode ? 'border-stone-800' : 'border-stone-100'}`}>
                <input 
                  type="text"
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  className={`flex-1 text-[11px] font-mono p-2 rounded-lg border outline-none text-center uppercase tracking-wider ${darkMode ? 'bg-black border-stone-800 text-stone-300' : 'bg-stone-50 border-stone-200 text-stone-600'}`}
                />
              </div>
            </motion.div>
          </div>,
          document.body
        )}
      </div>
    </div>
  );
}

function FontSelect({ label, value, onChange, darkMode }: { label: string, value: string, onChange: (v: string) => void, darkMode: boolean }) {
  return (
    <div className="space-y-2 group">
      <label className={`text-[9px] font-bold uppercase mb-1 block transition-colors duration-300 ${darkMode ? 'text-stone-500 group-hover:text-stone-400' : 'text-stone-600 group-hover:text-stone-800'}`}>{label}</label>
      <select 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        className={`w-full border p-2 text-xs rounded-xl outline-none appearance-none cursor-pointer transition-all duration-300 backdrop-blur-md shadow-inner focus:ring-2 focus:ring-red-900/30 ${darkMode ? 'bg-stone-900/50 border-stone-800/50 text-stone-300 hover:bg-stone-800/60 hover:border-red-900/50 hover:shadow-[0_0_15px_rgba(239,68,68,0.15)] focus:border-red-900/50' : 'bg-white/60 border-stone-200/50 text-stone-800 hover:bg-white/80 hover:border-red-300 hover:shadow-[0_0_15px_rgba(220,38,38,0.15)] focus:border-red-300'}`}
      >
        <optgroup label="Essential Classic">
          <option value="Verdana, Arial, Helvetica, sans-serif">Verdana</option>
          <option value="Georgia, serif">Georgia</option>
          <option value="Arial, sans-serif">Arial</option>
          <option value="'Times New Roman', Times, serif">Times New Roman</option>
          <option value="'Inter', sans-serif">Inter</option>
          <option value="Impact, Charcoal, sans-serif">Impact (Bold)</option>
        </optgroup>
        <optgroup label="Professional & Clean">
          <option value="'Trebuchet MS', Helvetica, sans-serif">Trebuchet MS</option>
          <option value="Tahoma, Geneva, sans-serif">Tahoma</option>
          <option value="'Lucida Sans Unicode', 'Lucida Grande', sans-serif">Lucida Sans</option>
          <option value="'Palatino Linotype', 'Book Antiqua', Palatino, serif">Palatino</option>
          <option value="'Century Gothic', AppleGothic, sans-serif">Century Gothic</option>
          <option value="Helvetica, Arial, sans-serif">Helvetica</option>
          <option value="'Optima', 'Segoe UI', Candara, Calibri, sans-serif">Optima</option>
          <option value="'Gill Sans', 'Gill Sans MT', Calibri, sans-serif">Gill Sans</option>
          <option value="'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif">Franklin Gothic</option>
        </optgroup>
        <optgroup label="Library & Bookish">
          <option value="'Garamond', 'Apple Garamond', Balkerville, serif">Garamond</option>
          <option value="'Book Antiqua', Palatino, serif">Book Antiqua</option>
          <option value="'Baskerville', 'Baskerville Old Face', 'Hoefler Text', Times New Roman, serif">Baskerville</option>
          <option value="'Constantia', 'Lucida Bright', Lucidabright, 'Lucida Serif', Lucida, 'DejaVu Serif', 'Bitstream Vera Serif', 'Liberation Serif', Georgia, serif">Classic Serif Mix</option>
          <option value="'Didot', 'Bodoni MT', 'Cochin', 'Baskerville', 'Title', 'Serif'">Didot (Fashion)</option>
          <option value="'Perpetua', Baskerville, 'Big Caslon', 'Palatino Linotype', serif">Perpetua</option>
        </optgroup>
        <optgroup label="Decorative / Fantasy">
          <option value="'Copperplate', 'Copperplate Gothic Light', fantasy">CopperplateStack</option>
          <option value="'Papyrus', fantasy">Papyrus</option>
          <option value="'Brush Script MT', cursive">Brush Script</option>
          <option value="'Courier New', Courier, monospace">Courier New</option>
          <option value="'Lucida Console', Monaco, monospace">Lucida Console</option>
          <option value="Geneva, Tahoma, sans-serif">Geneva</option>
          <option value="'Monaco', 'Lucida Console', monospace">Monaco</option>
          <option value="'American Typewriter', 'Courier New', Courier, monospace">American Typewriter</option>
          <option value="'Helvetica Neue', Helvetica, Arial, sans-serif">Helvetica</option>
        </optgroup>
        <optgroup label="System Smart Stacks">
          <option value="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">Modern Sans (Native)</option>
          <option value="ui-monospace, 'SF Mono', Menlo, Monaco, Consolas, monospace">Modern Mono (Native)</option>
          <option value="ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif">Modern Serif (Native)</option>
        </optgroup>
      </select>
    </div>
  );
}

function UrlInput({ label, value, onChange, darkMode }: { label: string, value: string, onChange: (v: string) => void, darkMode?: boolean }) {
  return (
    <div className="space-y-1.5 group">
      <label className={`text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-colors duration-300 ${darkMode ? 'text-stone-600 group-focus-within:text-red-400 group-hover:text-stone-400' : 'text-stone-400 group-focus-within:text-red-700 group-hover:text-stone-600'}`}>
        <ImageIcon size={10} className="transition-transform duration-300 group-focus-within:scale-110" /> {label}
      </label>
      <input 
        type="text" 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
        placeholder="https://images.neopets.com/..."
        className={`w-full border py-2 px-3 text-[10px] rounded-xl outline-none focus:ring-2 backdrop-blur-md shadow-inner transition-all duration-300 ${darkMode ? 'bg-stone-900/50 border-stone-800/50 text-stone-300 focus:bg-stone-800/80 focus:border-red-900/50 focus:shadow-[0_0_15px_rgba(239,68,68,0.15)] ring-red-900/30 hover:border-stone-700' : 'bg-white/60 border-stone-200/50 text-stone-700 focus:bg-white focus:border-red-300 focus:shadow-[0_0_15px_rgba(220,38,38,0.15)] ring-red-800/20 hover:border-stone-300'}`} 
      />
    </div>
  );
}

const EditorTooltip = ({ text, children }: { text: string, children: React.ReactNode }) => (
  <div className="group/tooltip relative inline-flex items-center justify-center">
    {children}
    <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[200px] opacity-0 group-hover/tooltip:opacity-100 transition-opacity bg-stone-900 border border-stone-800 text-stone-100 text-[10px] p-2 rounded shadow-lg z-[110] text-center">
      {text}
      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-stone-800" />
    </div>
  </div>
);

function ToggleRow({ label, description, checked, onChange, darkMode }: { label: string, description?: React.ReactNode, checked: boolean, onChange: (v: boolean) => void, darkMode?: boolean }) {
  return (
    <label className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all duration-300 backdrop-blur-md border group ${darkMode ? 'bg-stone-900/40 border-stone-800/60 hover:bg-stone-800/60 shadow-inner hover:shadow-[0_0_15px_rgba(239,68,68,0.15)] hover:border-red-900/50' : 'bg-white/60 border-stone-200/50 hover:bg-white hover:shadow-[0_0_15px_rgba(220,38,38,0.15)] hover:border-red-300 shadow-sm'}`}>
      <div className="flex-1 min-w-0">
        <span className={`block text-[10px] font-bold transition-colors uppercase tracking-tight ${checked ? (darkMode ? 'text-stone-200 group-hover:text-red-400' : 'text-red-950 group-hover:text-red-700') : (darkMode ? 'text-stone-500 group-hover:text-stone-300' : 'text-stone-500 group-hover:text-stone-800')}`}>{label}</span>
        {description && <span className={`block text-[8px] mt-1 leading-relaxed ${darkMode ? 'text-stone-500' : 'text-stone-400'}`}>{description}</span>}
      </div>
      <div onClick={(e) => { e.preventDefault(); onChange(!checked); }} className={`w-9 h-5 shrink-0 rounded-full relative transition-all duration-300 shadow-inner ${checked ? 'bg-red-800/90 shadow-[0_0_8px_rgba(153,27,27,0.5)]' : (darkMode ? 'bg-stone-800/80 group-hover:bg-stone-700/80' : 'bg-stone-200/80 group-hover:bg-stone-300/80')}`}>
        <div className={`absolute top-1 w-3 h-3 rounded-full transition-all duration-300 shadow-sm ${checked ? 'left-[18px] bg-white' : (darkMode ? 'left-1 bg-stone-400' : 'left-1 bg-white')}`} />
      </div>
    </label>
  );
}

// LOOKUP PREVIEW COMPONENT
function LookupPreview({ config, onEditPart: originalOnEditPart, updateConfig, dragMode, appendSnippet }: { config: LookupConfig, onEditPart: (tab: 'style' | 'layout' | 'pets' | 'content' | 'images') => void, updateConfig: (k: any, v: any) => void, dragMode: boolean, appendSnippet: (html: string, title: string) => void }) {
  const isDraggingRef = useRef(false);
  
  const onEditPart = (tab: 'style' | 'layout' | 'pets' | 'content' | 'images') => {
    if (isDraggingRef.current) return;
    originalOnEditPart(tab);
  };

  const scopedCss = config.customCss ? config.customCss.replace(/body/g, '#preview-container') : '';

  const DraggableWrapper = ({ id, children, className = '' }: { id: string, children: React.ReactNode, className?: string }) => {
    if (!dragMode) {
      // In normal mode, use standard rendering
      return <div id={id} className={className}>{children}</div>;
    }
    return (
      <motion.div
        id={id}
        className={`${className} cursor-grab active:cursor-grabbing outline outline-2 outline-dashed outline-transparent hover:outline-blue-500/50 transition-[outline-color]`}
        drag
        dragMomentum={false}
        whileDrag={{ scale: 1.02, zIndex: 100, opacity: 0.95 }}
        onDragStart={() => {
          isDraggingRef.current = true;
        }}
        initial={{ x: config.positions?.[id]?.x || 0, y: config.positions?.[id]?.y || 0 }}
        onDragEnd={(e, info) => {
          const currentPos = config.positions?.[id] || { x: 0, y: 0 };
          updateConfig('positions', {
            ...config.positions,
            [id]: { x: currentPos.x + info.offset.x, y: currentPos.y + info.offset.y }
          });
          setTimeout(() => {
            isDraggingRef.current = false;
          }, 150);
        }}
        style={{
           zIndex: 50,
        }}
      >
        {children}
        <div className="absolute -top-6 left-0 bg-red-800 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap">Drag to Move Module</div>
      </motion.div>
    );
  };

  return (
    <div 
      id="preview-container"
      className="min-h-full transition-all duration-300 pb-20 relative"
      style={{ 
        backgroundColor: config.bgColor, 
        backgroundImage: config.bgImage ? `url("${config.bgImage}")` : 'none', 
        backgroundAttachment: config.bgAttachment,
        backgroundPosition: config.bgPosition,
        backgroundRepeat: config.bgRepeat,
        backgroundSize: config.bgSize !== 'auto' ? config.bgSize : undefined,
        color: config.textColor, 
        fontFamily: config.fontFamily,
        fontSize: `${config.fontSize}px`
      }}
    >
      {scopedCss && <style>{scopedCss}</style>}
      {/* Assets Preview (Draggable) */}
      {config.customAssets.map((asset, i) => (
        <motion.div
           key={asset.id}
           drag
           dragMomentum={false}
           animate={{ left: asset.x, top: asset.y }}
           onDragEnd={(_, info) => {
             const newAssets = [...config.customAssets];
             newAssets[i].x += info.offset.x;
             newAssets[i].y += info.offset.y;
             updateConfig('customAssets', newAssets);
           }}
           className="absolute z-[2000] cursor-move active:scale-105 transition-transform group"
           style={{ left: asset.x, top: asset.y }}
        >
          <img src={asset.url || undefined} style={{ width: asset.width }} className="select-none pointer-events-none drop-shadow-lg" alt="" />
          <div className="absolute -top-6 left-0 bg-red-800 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap">Drag to Position</div>
        </motion.div>
      ))}

      <div className="w-full max-w-[996px] mx-auto flex flex-col items-center">
        {/* TOP NAVBAR (NEOPETS CLASSIC) */}
        {config.replaceNavbar ? (
          <div 
            className="w-full custom_navbar_preview" 
            dangerouslySetInnerHTML={{ __html: config.customNavbarHtml }} 
            onClick={() => onEditPart('layout')}
          />
        ) : (!config.hideHeader && !config.hideDefaultElements && (
          <div id="header" className="w-full" style={{ fontFamily: config.headerFont, fontSize: `${config.headerFontSize}px` }}>
            <div className={`bg-[#efefef] border-b border-[#cccccc] px-4 py-2 flex justify-end items-center font-bold gap-4`} style={{ color: config.headerTextColor }}>
              <span className="flex-1 text-left font-normal italic ml-36 self-end pb-1 opacity-70">Welcome to Neopets!</span>
              <div className="bg-stone-50 px-2 py-1 border border-stone-200 rounded flex gap-4">
                <span>Welcome, <b className="text-red-800 underline cursor-pointer">{config.username}</b></span>
                <span className="text-[#000000]">NP: <span className="text-stone-900 underline underline-offset-2 decoration-red-800/30">2,533</span></span>
                <span className="text-red-900 cursor-pointer">Logout</span>
              </div>
            </div>
            <div className="bg-white px-8 py-3 border-b border-[#cccccc] flex justify-between items-end bg-[url('https://images.neopets.com/themes/000_def_f65b1/navigation/main_bg.png')] bg-repeat-x">
              <img src="https://images.neopets.com/themes/000_def_f65b1/navigation/logo.png" className="h-16 -mb-4 drop-shadow-md" alt="Neo" />
              <div className="flex flex-col items-end gap-1">
                <div className="flex gap-4 text-[11px] font-bold text-stone-600 uppercase tracking-tighter pb-1">
                  <span>Account</span><span>Customise</span><span>Games</span><span>Explore</span><span>News</span><span>Community</span>
                </div>
                {config.customLinks.length > 0 && (
                  <div className="flex gap-3 text-[9px] font-black text-red-800 uppercase tracking-tight">
                    {config.customLinks.map((link, i) => (
                      <span key={i} className="hover:underline cursor-pointer">{link.label}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="text-[10px] font-black text-stone-400 ml-4 pb-1">9:44:08 PM NST</div>
            </div>
          </div>
        ))}

        <div className="w-full px-4 pt-6 space-y-6">
          {/* USER LOOKUP HEADER */}
          {!config.hideULText && (
            <div 
              className="relative group/title text-center font-bold text-sm mb-4 cursor-pointer hover:underline decoration-red-800 underline-offset-4" 
              onClick={(e) => { e.stopPropagation(); onEditPart('style'); }}
            >
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 opacity-0 group-hover/title:opacity-100 transition-opacity bg-stone-800 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded shadow-lg">
                Edit Title Details
              </div>
              User Lookup: {config.username} <span className="text-[#000099] text-[18px] ml-1 cursor-help hover:text-red-800 transition-colors">?</span>
            </div>
          )}

          {/* ABOUT ME SECTION (WYSIWYG) */}
          <DraggableWrapper 
            id="userabout"
            className="cursor-pointer hover:ring-2 ring-red-800 rounded-lg p-6 mb-6 relative group border-2 border-transparent transition-all hover:bg-stone-50/20"
          >
            <div onClick={(e) => { e.stopPropagation(); onEditPart('content'); }}>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                const intros = [
                  "Welcome to my lookup! I love collecting stamps and playing with my pets.",
                  "Hi! I'm a long-time Neopian looking to trade some NC items.",
                  "Stay a while and listen! My pets are my world.",
                  "Mainly here for the Battledome these days. Check out my stats!"
                ];
                appendSnippet(`\n<p style="text-align: center; font-style: italic;">"${intros[Math.floor(Math.random()*intros.length)]}"</p>`, 'Intro');
              }}
              className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 bg-white/90 border border-stone-200 text-stone-600 text-[8px] font-black uppercase px-2 py-1 rounded shadow-sm hover:bg-red-800 hover:text-white transition-all z-20"
              title="Add Random Intro"
            >
              + Quick Intro
            </button>
            <div className="relative z-10 w-full min-h-[50px]">
              {(!config.bioSections || config.bioSections.length === 0) ? (
                <div dangerouslySetInnerHTML={{ __html: config.aboutMe }} />
              ) : config.bioLayout === 'side-by-side' ? (
                <div style={{ display: 'table', width: '100%', borderSpacing: '15px' }}>
                  {config.bioSections.map(section => (
                     <div key={section.id} style={{ display: 'table-cell', verticalAlign: 'top' }} dangerouslySetInnerHTML={{ __html: section.content }} />
                  ))}
                </div>
              ) : config.bioLayout === 'grid' ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'space-around' }}>
                  {config.bioSections.map(section => (
                     <div key={section.id} style={{ flex: '1 1 300px' }} dangerouslySetInnerHTML={{ __html: section.content }} />
                  ))}
                </div>
              ) : (
                config.bioSections.map(section => (
                  <div key={section.id} style={{ marginBottom: '20px' }} dangerouslySetInnerHTML={{ __html: section.content }} />
                ))
              )}
            </div>
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-red-800 text-white text-[8px] font-black uppercase px-3 py-1.5 rounded-full shadow-lg pointer-events-none transition-opacity">Click to Edit Profile Bio</div>
            </div>
          </DraggableWrapper>

          {/* MODULE GRID (THE TRINITY) */}
          <div className="flex gap-2">
            <DraggableWrapper id="userinfo" className="flex-[2] h-full">
              <div onClick={() => onEditPart('style')} className="h-full">
              <Module config={config} title="User Info">
                  <div className="flex gap-4 text-[11px] h-full">
                    <div className="flex-1 space-y-2.5">
                        <div className="group/inline relative" onClick={(e) => e.stopPropagation()}>
                          <p><b>Name:</b> 
                            <input 
                               type="text" 
                               value={config.username} 
                               onChange={(e) => updateConfig('username', e.target.value)}
                               onMouseDown={(e) => e.stopPropagation()}
                               className="bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-red-800/30 rounded px-1 -ml-1 font-bold w-32 cursor-text" 
                            />
                          </p>
                          <div className="absolute -top-4 left-0 bg-red-800 text-white text-[7px] font-black uppercase px-2 py-0.5 rounded opacity-0 group-hover/inline:opacity-100 pointer-events-none transition-opacity">Direct Name Edit</div>
                        </div>
                        <div className="group/inline relative" onClick={(e) => e.stopPropagation()}>
                          <p><b>Gender:</b> 
                            <span 
                              style={{ color: config.userGenderColor }} 
                              className="font-bold underline cursor-pointer hover:bg-stone-200 px-1 rounded transition-colors"
                              onClick={() => onEditPart('style')}
                            >
                              Male
                            </span>
                          </p>
                        </div>
                        <div className="group/inline relative" onClick={(e) => e.stopPropagation()}>
                          <p><b>Country:</b> 
                            <input 
                              type="text" 
                              defaultValue="Neopia Central"
                              onMouseDown={(e) => e.stopPropagation()}
                              className="bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-red-800/30 rounded px-1 -ml-1 text-stone-500 hover:text-red-800 cursor-text w-32" 
                            />
                          </p>
                        </div>
                       <div className="pt-6 space-y-1.5 text-stone-500">
                          <p><b>Last Spotted:</b> Under one day ago</p>
                          <p><b>Started Playing:</b> January 1, 2000</p>
                       </div>
                    </div>
                    <div className="w-32 flex flex-col items-center justify-center pt-2">
                       <div 
                         className="w-24 h-auto min-h-[96px] bg-stone-50 border border-stone-200 shadow-inner rounded-xl flex items-center justify-center overflow-hidden transition-all group-hover/mod:scale-105 hover:border-red-500 cursor-pointer relative"
                         onClick={(e) => { e.stopPropagation(); onEditPart('images'); }}
                       >
                          <img src={config.shieldUrl || undefined} alt="shield" className="w-full h-auto object-contain" />
                          <div className="absolute inset-0 bg-red-800/20 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                             <div className="bg-red-800 text-white text-[7px] font-black px-2 py-1 rounded">SWAP SHIELD</div>
                          </div>
                       </div>
                       <span className="text-[10px] font-black text-stone-400 mt-2 tracking-tighter uppercase italic">13½ years</span>
                    </div>
                  </div>
                 <div className="border-t border-stone-100 mt-4 pt-4 flex justify-around bg-stone-50/50 -mx-4 -mb-4">
                    <UIIcon label="Trades" config={config} />
                    <UIIcon label="Auctions" config={config} />
                    <UIIcon label="Wishlist" config={config} />
                    <UIIcon label="Neomail" config={config} />
                    <UIIcon label="Friend" config={config} />
                 </div>
              </Module>
              </div>
            </DraggableWrapper>

            {!config.hideCollections && (
              <DraggableWrapper id="usercollections" className="flex-1">
                <div onClick={() => onEditPart('layout')} className="h-full">
                <Module config={config} title="Collections">
                   <div className="grid grid-cols-2 gap-x-2 gap-y-6 text-[10px]">
                      <ColItem label="Secret Avatars" val="10" config={config} />
                      <ColItem label="Key Quest Tokens" val="7" config={config} />
                      <ColItem label="Stamps" val="0" config={config} />
                      <ColItem label="Neodeck" val="0" config={config} />
                      <ColItem label="Site Themes" val="0" config={config} />
                      <ColItem label="Battledome Wins" val="0" config={config} />
                   </div>
                </Module>
                </div>
              </DraggableWrapper>
            )}

            {!config.hideShop && (
              <DraggableWrapper id="usershop" className="flex-[0.8]">
                <div onClick={() => onEditPart('layout')} className="h-full">
                <Module config={config} title="Shop & Gallery">
                   <div className="flex flex-col items-center justify-center text-center space-y-4 text-[11px] h-full" onClick={(e) => e.stopPropagation()}>
                      <div 
                        className={`w-28 h-28 bg-stone-50 border border-stone-200 shadow-inner rounded-2xl flex items-center justify-center overflow-hidden transition-all group-hover/mod:scale-105 hover:border-red-500 cursor-pointer relative ${config.blendIcons ? 'p-2 bg-white' : ''}`}
                        onClick={() => onEditPart('images')}
                      >
                        <img src={config.shopkeeperUrl || "https://images.neopets.com/new_shopkeepers/0.gif"} className="h-20" alt="shopkeeper" />
                        <div className="absolute inset-0 bg-red-800/10 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                           <div className="bg-red-800 text-white text-[7px] font-black px-2 py-1 rounded">CHANGE IMAGE</div>
                        </div>
                      </div>
                      <div className="leading-snug w-full">
                        <div className="relative group/editshop">
                           <input 
                              type="text" 
                              defaultValue={`The ${config.username}'s Gallery`}
                              className="w-full text-center font-bold text-red-900 bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-red-800/20 rounded cursor-text" 
                           />
                           <div className="absolute -top-3 left-1/2 -translate-x-1/2 opacity-0 group-hover/editshop:opacity-100 transition-opacity whitespace-nowrap bg-red-800 text-white text-[6px] font-black px-1.5 py-0.5 rounded pointer-events-none">Gallery Name</div>
                        </div>
                        <p className="text-[9px] font-black uppercase text-stone-400 mt-1 tracking-widest">Size: 3 Items</p>
                      </div>
                   </div>
                </Module>
                </div>
              </DraggableWrapper>
            )}
          </div>

          {!config.hideNeohome && (
            <DraggableWrapper id="userneohome" className="mt-4">
              <div onClick={() => onEditPart('layout')}>
              <Module config={config} title="Neohome">
                <div className="flex items-center gap-6 p-2">
                   <div 
                     className="w-48 h-32 bg-stone-100 rounded-lg overflow-hidden border border-stone-200 cursor-pointer relative group/neohome"
                     onClick={(e) => { e.stopPropagation(); onEditPart('images'); }}
                   >
                      <img src={config.neohomeUrl || "https://images.neopets.com/neohomes/levels/lvl1.gif"} className="w-full h-full object-cover transition-transform group-hover/neohome:scale-105" alt="neohome" />
                      <div className="absolute inset-0 bg-red-800/10 opacity-0 group-hover/neohome:opacity-100 flex items-center justify-center transition-opacity">
                         <div className="bg-red-800 text-white text-[7px] font-black px-2 py-1 rounded">CHANGE IMAGE</div>
                      </div>
                   </div>
                   <div className="flex-1 space-y-2">
                      <p className="text-sm font-bold text-red-900 leading-tight">View {config.username}'s Neohome</p>
                      <p className="text-[10px] text-stone-500 italic">"It's a work in progress, but it's home!"</p>
                      <div className="flex gap-2">
                         <span className="px-2 py-1 bg-stone-100 rounded text-[9px] font-bold text-stone-500 uppercase">3 Rooms</span>
                         <span className="px-2 py-1 bg-stone-100 rounded text-[9px] font-bold text-stone-500 uppercase">2 Gardens</span>
                      </div>
                   </div>
                </div>
              </Module>
              </div>
            </DraggableWrapper>
          )}

          {/* PET CAROUSEL SECTION */}
          {!config.hidePetCarousel && (
            <DraggableWrapper id="userneopets" className="mt-4">
              <div onClick={() => onEditPart('pets')}>
              <Module config={config} title="Neopets">
                 <div className={`flex relative ${config.petDisplay === 'grid' ? 'flex-col items-center' : 'items-center gap-4'}`}>
                    {config.petDisplay === 'carousel' && (
                       <div className="w-10 h-10 rounded-full border-2 border-stone-200 flex items-center justify-center text-stone-400"><ChevronDown className="rotate-90" /></div>
                    )}
                    
                    <div 
                      className={`overflow-hidden px-4 ${config.petDisplay === 'grid' ? 'w-full' : 'flex flex-1 justify-around gap-x-12'}`}
                      style={config.petDisplay === 'grid' ? {
                        display: 'grid',
                        gridTemplateColumns: `repeat(${config.petGridCols}, 1fr)`,
                        gap: '20px'
                      } : {}}
                    >
                       {config.pets.slice(0, config.previewPetCount).map((pet, i) => (
                         <PetCard 
                           key={i}
                           name={pet.name} 
                           species={pet.species || (i % 2 === 0 ? "Female Meerca" : "Male Bori")} 
                           age={pet.age || "1,000 days"} 
                           lvl={pet.lvl || "1"} 
                           img={pet.image} 
                           config={config}
                           onNameChange={(newName) => {
                             const newPets = [...config.pets];
                             newPets[i].name = newName;
                             updateConfig('pets', newPets);
                           }}
                         />
                       ))}
                    </div>

                    {config.petDisplay === 'carousel' && (
                       <div className="w-10 h-10 rounded-full border-2 border-stone-200 flex items-center justify-center text-stone-400"><ChevronDown className="-rotate-90" /></div>
                    )}
                 </div>
              </Module>
              </div>
            </DraggableWrapper>
          )}

          {/* BOTTOM GRID (TROPHIES & NC MALL) */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mt-4 items-start">
            {!config.hideTrophies && (
              <DraggableWrapper id="usertrophies" className="md:col-span-3">
                <div onClick={() => onEditPart('layout')}>
                <Module config={config} title="Trophies">
                  <div className="p-6">
                    <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-y-8 gap-x-4">
                       {[15, 22, 56, 12, 102, 33, 44, 88, 5, 21, 64, 76, 91, 10, 4, 30].map(i => (
                         <div key={i} className="flex flex-col items-center gap-1">
                            <div className={`w-14 h-14 bg-stone-50 border border-stone-200 flex items-center justify-center overflow-hidden mb-1 ${config.blendIcons ? 'bg-white p-1' : ''}`}>
                               <img 
                                 src={`https://images.neopets.com/trophies/${i}_1.gif`} 
                                 alt="trph" 
                                 className="w-full h-full object-contain"
                                 style={{ 
                                   filter: config.blendIcons ? 'contrast(1.1)' : 'none',
                                   backgroundColor: config.matchTrophyBg ? '#ffffff' : 'transparent'
                                 }}
                               />
                            </div>
                            <span className="text-[9px] font-bold text-center text-stone-500 leading-tight uppercase">Game Name {i}</span>
                            <span className="text-[7px] font-black text-red-900 uppercase">Silver</span>
                         </div>
                       ))}
                    </div>
                  </div>
                </Module>
                </div>
              </DraggableWrapper>
            )}

            {!config.hideNCMall && (
              <DraggableWrapper id="ncmall" className="md:col-span-1">
                <div onClick={() => onEditPart('layout')} className="h-full">
                <Module config={config} title="NC MALL">
                  <div className="p-6 flex flex-col gap-8 items-center bg-stone-50/30 h-full justify-center min-h-[300px]">
                     <NCMallItem label="Mall Album" img="https://images.neopets.com/ncmall/album/album_thumb.gif" config={config} />
                     <NCMallItem label="Collectible Case" img="https://images.neopets.com/ncmall/collectibles/nc-collect-album-item.gif" config={config} />
                     <NCMallItem label="Wish List" img="https://images.neopets.com/ncmall/wishlist/nc-wish-list.gif" config={config} />
                  </div>
                </Module>
                </div>
              </DraggableWrapper>
            )}
          </div>
        </div>

        {/* FOOTER */}
        {!config.hideFooter && !config.hideDefaultElements && (
          <div id="footer" className="w-full mt-24">
             <div className="bg-[#222] bg-[url('https://images.neopets.com/themes/000_def_f65b1/navigation/main_bg_rev.png')] bg-repeat-x py-16 px-12 text-center">
                <p className="text-[10px] text-stone-500 max-w-2xl mx-auto leading-[2em] font-medium tracking-tight">
                  NEOPETS and all related indicia are trademarks of <b className="text-stone-300">Neopets, Inc.</b>, © 1999-2024. All rights reserved.
                </p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Module({ config, title, children }: { config: LookupConfig, title: string, children: React.ReactNode }) {
  return (
    <div 
      className="contentModule overflow-hidden h-full flex flex-col group/mod relative transition-all border border-stone-200 bg-white cursor-pointer"
      style={{ 
        backgroundColor: config.moduleContentBg, 
        borderColor: config.moduleBorder, 
        borderWidth: `${config.moduleBorderSize}px`,
        fontFamily: config.moduleFont,
        borderRadius: `${config.moduleBorderRadius}px`
      }}
    >
      <div className="absolute top-2 right-2 z-20 opacity-0 group-hover/mod:opacity-100 transition-opacity flex gap-1 pointer-events-none">
        <div className="bg-red-800 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded shadow-lg">
          Click to Edit
        </div>
      </div>
      {!config.hideModuleHeaders && (
        <div 
          className="contentModuleHeader p-2.5 font-black uppercase tracking-[0.1em] flex justify-between items-center transition-colors shadow-sm"
          style={{ 
            backgroundColor: config.moduleHeaderBg, 
            color: config.moduleHeaderText,
            fontFamily: config.moduleFont,
            fontSize: `${config.moduleFontSize}px`
          }}
        >
          {title}
          <ChevronRight size={10} className="stroke-[4px] opacity-20 group-hover/mod:opacity-80 transition-opacity" />
        </div>
      )}
      <div 
        className="contentModuleContent flex-1" 
        style={{ 
          backgroundColor: config.moduleContentBg,
          padding: `${config.modulePadding}px`
        }}
      >
        {children}
      </div>
      <div className="absolute inset-0 ring-4 ring-red-800 opacity-0 group-hover/mod:opacity-100 pointer-events-none transition-opacity rounded-[1px] m-[-1px]" />
    </div>
  );
}

function PetCard({ name, species, age, lvl, img, config, onNameChange }: { name: string; species: string; age: string; lvl: string; img: string; config: LookupConfig; onNameChange?: (v: string) => void; [key: string]: any }) {
  const isGrid = config.petDisplay === 'grid';
  
  return (
    <div 
      className={`flex flex-col items-center group/pet transition-all duration-300 ${isGrid ? 'w-full' : 'shrink-0'}`}
      style={!isGrid ? { width: `${(config.petImageSize || 120) + 30}px` } : {}}
      onClick={(e) => e.stopPropagation()}
    >
       <motion.div 
         className={`bg-stone-50 border shadow-inner transition-all flex items-center justify-center overflow-hidden z-0 hover:z-10 ${config.blendIcons ? 'bg-white p-3' : 'p-2'} mx-auto`}
         style={isGrid ? { 
           borderRadius: `${config.petBorderRadius}px`,
           border: `${config.petBorderSize}px solid ${config.petBorderColor}`,
           width: '100%',
           maxWidth: `${config.petImageSize || 120}px`,
           aspectRatio: '1/1'
         } : { 
           borderRadius: `${config.petBorderRadius}px`,
           border: `${config.petBorderSize}px solid ${config.petBorderColor}`,
           width: `${config.petImageSize || 120}px`,
           height: `${config.petImageSize || 120}px`,
         }}
         whileHover={{ scale: config.petHoverScale }}
       >
          <img src={img || undefined} alt={name} className="w-full h-full object-cover" style={{ borderRadius: `${config.petBorderRadius * 0.8}px` }} />
       </motion.div>
       <div className="text-[10px] leading-tight text-center mt-3 w-full">
         <div className="relative group/editpet">
           <input 
             type="text" 
             value={name} 
             onChange={(e) => onNameChange?.(e.target.value)}
             onMouseDown={(e) => e.stopPropagation()}
             className="w-full text-center font-bold text-stone-900 text-xs mb-0.5 bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-red-800/20 rounded cursor-text"
           />
           <div className="absolute -top-3 left-1/2 -translate-x-1/2 opacity-0 group-hover/editpet:opacity-100 transition-opacity whitespace-nowrap bg-red-800 text-white text-[6px] font-black px-1.5 py-0.5 rounded pointer-events-none">Edit Name</div>
         </div>
         {!config.hidePetDetails && (
           <div className="opacity-60 group-hover:opacity-100 transition-opacity">
              <p style={{ color: config.petGenderColor }} className="font-black text-[8px] uppercase tracking-wider mb-1">{species}</p>
              <hr className="w-8 mx-auto border-stone-100 mb-2" />
              <div className="text-stone-400 text-[8px] font-bold space-y-0.5">
                <p>Age: {age}</p>
                <p>Level: {lvl}</p>
              </div>
           </div>
         )}
       </div>
    </div>
  );
}

function ColItem({ label, val, config }: { label: string, val: string, config: LookupConfig }) {
  return (
    <div className="flex flex-col items-center text-center gap-1.5 group cursor-pointer">
      <div className={`w-10 h-10 bg-stone-50 border border-stone-200 rounded-xl flex items-center justify-center text-stone-300 group-hover:bg-red-50 transition-all shadow-sm ${config.blendIcons ? 'bg-white border-red-800/10' : ''}`}>
        <Star size={14} fill="currentColor" stroke="none" className="opacity-40 group-hover:text-red-900 group-hover:rotate-12 transition-all" />
      </div>
      <div className="leading-tight">
        <b className="block text-[7px] uppercase font-black text-stone-400 tracking-tighter">{label}</b>
        <span className="text-[11px] font-black text-red-950">{val}</span>
      </div>
    </div>
  );
}

function UIIcon({ label, config }: { label: string, config: LookupConfig }) {
  return (
    <div className="flex flex-col items-center gap-1.5 cursor-pointer group">
      <div className={`w-9 h-9 rounded-full bg-white border border-stone-200 shadow-sm flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all ring-4 ring-transparent hover:ring-red-100 ${config.blendIcons ? 'border-red-800/20' : ''}`}>
         <div className="w-6 h-6 bg-red-800/10 rounded-full flex items-center justify-center text-red-800"><Layout size={10} /></div>
      </div>
      <span className="text-[7px] font-black uppercase text-stone-500 group-hover:text-red-900 tracking-tighter">{label}</span>
    </div>
  );
}

function NCMallItem({ img, label, config }: { img: string, label: string, config: LookupConfig }) {
  return (
    <div className="flex flex-col items-center gap-2 cursor-pointer group">
       <div className={`w-14 h-14 bg-white border border-stone-200 rounded-2xl flex items-center justify-center p-3 group-hover:scale-110 group-hover:shadow-lg transition-all ${config.blendIcons ? 'border-red-800/10' : ''}`}>
         <img src={img || undefined} alt="mall" className="h-full object-contain" />
       </div>
       <span className="text-[8px] font-black text-center text-stone-500 uppercase tracking-tight group-hover:text-red-900 leading-none">{label}</span>
    </div>
  );
}
