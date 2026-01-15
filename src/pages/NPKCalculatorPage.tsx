import { ArrowLeft, Calculator, Leaf, AlertTriangle, Info } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import villageBg from "@/assets/bangladesh-village-bg.jpg";
import { Input } from "@/components/ui/input";

const crops = [
  // সিরিয়াল/শস্য
  { id: "rice", name: "ধান", emoji: "🌾" },
  { id: "wheat", name: "গম", emoji: "🌿" },
  { id: "corn", name: "ভুট্টা", emoji: "🌽" },
  { id: "barley", name: "যব", emoji: "🌾" },
  { id: "millet", name: "বাজরা", emoji: "🌾" },
  
  // সবজি
  { id: "potato", name: "আলু", emoji: "🥔" },
  { id: "onion", name: "পেঁয়াজ", emoji: "🧅" },
  { id: "tomato", name: "টমেটো", emoji: "🍅" },
  { id: "eggplant", name: "বেগুন", emoji: "🍆" },
  { id: "cabbage", name: "বাঁধাকপি", emoji: "🥬" },
  { id: "cauliflower", name: "ফুলকপি", emoji: "🥦" },
  { id: "carrot", name: "গাজর", emoji: "🥕" },
  { id: "radish", name: "মুলা", emoji: "🥗" },
  { id: "spinach", name: "পালং শাক", emoji: "🥬" },
  { id: "redSpinadh", name: "লাল শাক", emoji: "🌿" },
  { id: "gourd", name: "লাউ", emoji: "🫛" },
  { id: "pumpkin", name: "কুমড়া", emoji: "🎃" },
  { id: "cucumber", name: "শসা", emoji: "🥒" },
  { id: "bitterGourd", name: "করলা", emoji: "🥒" },
  { id: "okra", name: "ঢেঁড়স", emoji: "🌿" },
  { id: "taro", name: "কচু", emoji: "🥔" },
  { id: "sweetPotato", name: "মিষ্টি আলু", emoji: "🍠" },
  { id: "beans", name: "শিম/বরবটি", emoji: "🫘" },
  { id: "chili", name: "মরিচ", emoji: "🌶️" },
  { id: "garlic", name: "রসুন", emoji: "🧄" },
  
  // মসলা/তেলবীজ
  { id: "mustard", name: "সরিষা", emoji: "🌻" },
  { id: "ginger", name: "আদা", emoji: "🫚" },
  { id: "turmeric", name: "হলুদ", emoji: "🌿" },
  { id: "coriander", name: "ধনিয়া", emoji: "🌿" },
  { id: "cumin", name: "জিরা", emoji: "🌿" },
  { id: "sesame", name: "তিল", emoji: "🌿" },
  { id: "sunflower", name: "সূর্যমুখী", emoji: "🌻" },
  { id: "groundnut", name: "চিনাবাদাম", emoji: "🥜" },
  
  // ডাল
  { id: "lentil", name: "মসুর ডাল", emoji: "🫘" },
  { id: "chickpea", name: "ছোলা", emoji: "🫘" },
  { id: "greenGram", name: "মুগ ডাল", emoji: "🫘" },
  { id: "blackGram", name: "মাষকলাই", emoji: "🫘" },
  { id: "pigeonPea", name: "অড়হর ডাল", emoji: "🫘" },
  
  // ফল
  { id: "mango", name: "আম", emoji: "🥭" },
  { id: "banana", name: "কলা", emoji: "🍌" },
  { id: "papaya", name: "পেঁপে", emoji: "🍈" },
  { id: "guava", name: "পেয়ারা", emoji: "🍐" },
  { id: "lemon", name: "লেবু", emoji: "🍋" },
  { id: "watermelon", name: "তরমুজ", emoji: "🍉" },
  { id: "jackfruit", name: "কাঁঠাল", emoji: "🍈" },
  { id: "litchi", name: "লিচু", emoji: "🍒" },
  
  // অন্যান্য
  { id: "jute", name: "পাট", emoji: "🌿" },
  { id: "sugarcane", name: "আখ", emoji: "🎋" },
  { id: "tea", name: "চা", emoji: "🍵" },
  { id: "cotton", name: "তুলা", emoji: "☁️" },
  { id: "tobacco", name: "তামাক", emoji: "🌿" },
];

// Base fertilizer per acre (in kg)
const baseFertilizers: Record<string, { name: string; npk: string; color: string; baseAmount: number }[]> = {
  // সিরিয়াল/শস্য
  rice: [
    { name: "ইউরিয়া", npk: "৪৬-০-০", color: "bg-chart-3", baseAmount: 80 },
    { name: "TSP", npk: "০-৪৬-০", color: "bg-chart-2", baseAmount: 40 },
    { name: "MOP", npk: "০-০-৬০", color: "bg-primary", baseAmount: 30 },
    { name: "DAP", npk: "১৮-৪৬-০", color: "bg-chart-4", baseAmount: 25 },
  ],
  wheat: [
    { name: "ইউরিয়া", npk: "৪৬-০-০", color: "bg-chart-3", baseAmount: 70 },
    { name: "TSP", npk: "০-৪৬-০", color: "bg-chart-2", baseAmount: 56 },
    { name: "MOP", npk: "০-০-৬০", color: "bg-primary", baseAmount: 22 },
  ],
  corn: [
    { name: "ইউরিয়া", npk: "৪৬-০-০", color: "bg-chart-3", baseAmount: 200 },
    { name: "TSP", npk: "০-৪৬-০", color: "bg-chart-2", baseAmount: 100 },
    { name: "MOP", npk: "০-০-৬০", color: "bg-primary", baseAmount: 80 },
    { name: "জিংক সালফেট", npk: "০-০-০-০", color: "bg-chart-4", baseAmount: 4 },
  ],
  barley: [
    { name: "ইউরিয়া", npk: "৪৬-০-০", color: "bg-chart-3", baseAmount: 60 },
    { name: "TSP", npk: "০-৪৬-০", color: "bg-chart-2", baseAmount: 45 },
    { name: "MOP", npk: "০-০-৬০", color: "bg-primary", baseAmount: 20 },
  ],
  millet: [
    { name: "ইউরিয়া", npk: "৪৬-০-০", color: "bg-chart-3", baseAmount: 50 },
    { name: "TSP", npk: "০-৪৬-০", color: "bg-chart-2", baseAmount: 30 },
    { name: "MOP", npk: "০-০-৬০", color: "bg-primary", baseAmount: 20 },
  ],
  
  // সবজি
  potato: [
    { name: "ইউরিয়া", npk: "৪৬-০-০", color: "bg-chart-3", baseAmount: 140 },
    { name: "TSP", npk: "০-৪৬-০", color: "bg-chart-2", baseAmount: 90 },
    { name: "MOP", npk: "০-০-৬০", color: "bg-primary", baseAmount: 120 },
    { name: "জিপসাম", npk: "০-০-০-১৮", color: "bg-chart-5", baseAmount: 48 },
  ],
  onion: [
    { name: "ইউরিয়া", npk: "৪৬-০-০", color: "bg-chart-3", baseAmount: 80 },
    { name: "TSP", npk: "০-৪৬-০", color: "bg-chart-2", baseAmount: 60 },
    { name: "MOP", npk: "০-০-৬০", color: "bg-primary", baseAmount: 60 },
    { name: "সালফার", npk: "০-০-০-০", color: "bg-chart-4", baseAmount: 8 },
  ],
  tomato: [
    { name: "ইউরিয়া", npk: "৪৬-০-০", color: "bg-chart-3", baseAmount: 120 },
    { name: "TSP", npk: "০-৪৬-০", color: "bg-chart-2", baseAmount: 100 },
    { name: "MOP", npk: "০-০-৬০", color: "bg-primary", baseAmount: 80 },
    { name: "বোরন", npk: "০-০-০-০", color: "bg-chart-5", baseAmount: 4 },
  ],
  eggplant: [
    { name: "ইউরিয়া", npk: "৪৬-০-০", color: "bg-chart-3", baseAmount: 100 },
    { name: "TSP", npk: "০-৪৬-০", color: "bg-chart-2", baseAmount: 80 },
    { name: "MOP", npk: "০-০-৬০", color: "bg-primary", baseAmount: 60 },
  ],
  cabbage: [
    { name: "ইউরিয়া", npk: "৪৬-০-০", color: "bg-chart-3", baseAmount: 110 },
    { name: "TSP", npk: "০-৪৬-০", color: "bg-chart-2", baseAmount: 70 },
    { name: "MOP", npk: "০-০-৬০", color: "bg-primary", baseAmount: 50 },
    { name: "বোরন", npk: "০-০-০-০", color: "bg-chart-5", baseAmount: 3 },
  ],
  cauliflower: [
    { name: "ইউরিয়া", npk: "৪৬-০-০", color: "bg-chart-3", baseAmount: 120 },
    { name: "TSP", npk: "০-৪৬-০", color: "bg-chart-2", baseAmount: 75 },
    { name: "MOP", npk: "০-০-৬০", color: "bg-primary", baseAmount: 55 },
    { name: "বোরন", npk: "০-০-০-০", color: "bg-chart-5", baseAmount: 4 },
  ],
  carrot: [
    { name: "ইউরিয়া", npk: "৪৬-০-০", color: "bg-chart-3", baseAmount: 70 },
    { name: "TSP", npk: "০-৪৬-০", color: "bg-chart-2", baseAmount: 60 },
    { name: "MOP", npk: "০-০-৬০", color: "bg-primary", baseAmount: 80 },
  ],
  radish: [
    { name: "ইউরিয়া", npk: "৪৬-০-০", color: "bg-chart-3", baseAmount: 60 },
    { name: "TSP", npk: "০-৪৬-০", color: "bg-chart-2", baseAmount: 40 },
    { name: "MOP", npk: "০-০-৬০", color: "bg-primary", baseAmount: 40 },
  ],
  spinach: [
    { name: "ইউরিয়া", npk: "৪৬-০-০", color: "bg-chart-3", baseAmount: 80 },
    { name: "TSP", npk: "০-৪৬-০", color: "bg-chart-2", baseAmount: 30 },
    { name: "MOP", npk: "০-০-৬০", color: "bg-primary", baseAmount: 25 },
  ],
  redSpinadh: [
    { name: "ইউরিয়া", npk: "৪৬-০-০", color: "bg-chart-3", baseAmount: 75 },
    { name: "TSP", npk: "০-৪৬-০", color: "bg-chart-2", baseAmount: 28 },
    { name: "MOP", npk: "০-০-৬০", color: "bg-primary", baseAmount: 22 },
  ],
  gourd: [
    { name: "ইউরিয়া", npk: "৪৬-০-০", color: "bg-chart-3", baseAmount: 100 },
    { name: "TSP", npk: "০-৪৬-০", color: "bg-chart-2", baseAmount: 60 },
    { name: "MOP", npk: "০-০-৬০", color: "bg-primary", baseAmount: 50 },
  ],
  pumpkin: [
    { name: "ইউরিয়া", npk: "৪৬-০-০", color: "bg-chart-3", baseAmount: 90 },
    { name: "TSP", npk: "০-৪৬-০", color: "bg-chart-2", baseAmount: 55 },
    { name: "MOP", npk: "০-০-৬০", color: "bg-primary", baseAmount: 45 },
  ],
  cucumber: [
    { name: "ইউরিয়া", npk: "৪৬-০-০", color: "bg-chart-3", baseAmount: 85 },
    { name: "TSP", npk: "০-৪৬-০", color: "bg-chart-2", baseAmount: 50 },
    { name: "MOP", npk: "০-০-৬০", color: "bg-primary", baseAmount: 40 },
  ],
  bitterGourd: [
    { name: "ইউরিয়া", npk: "৪৬-০-০", color: "bg-chart-3", baseAmount: 95 },
    { name: "TSP", npk: "০-৪৬-০", color: "bg-chart-2", baseAmount: 55 },
    { name: "MOP", npk: "০-০-৬০", color: "bg-primary", baseAmount: 45 },
  ],
  okra: [
    { name: "ইউরিয়া", npk: "৪৬-০-০", color: "bg-chart-3", baseAmount: 70 },
    { name: "TSP", npk: "০-৪৬-০", color: "bg-chart-2", baseAmount: 45 },
    { name: "MOP", npk: "০-০-৬০", color: "bg-primary", baseAmount: 35 },
  ],
  taro: [
    { name: "ইউরিয়া", npk: "৪৬-০-০", color: "bg-chart-3", baseAmount: 90 },
    { name: "TSP", npk: "০-৪৬-০", color: "bg-chart-2", baseAmount: 50 },
    { name: "MOP", npk: "০-০-৬০", color: "bg-primary", baseAmount: 70 },
  ],
  sweetPotato: [
    { name: "ইউরিয়া", npk: "৪৬-০-০", color: "bg-chart-3", baseAmount: 60 },
    { name: "TSP", npk: "০-৪৬-০", color: "bg-chart-2", baseAmount: 40 },
    { name: "MOP", npk: "০-০-৬০", color: "bg-primary", baseAmount: 90 },
  ],
  beans: [
    { name: "ইউরিয়া", npk: "৪৬-০-০", color: "bg-chart-3", baseAmount: 30 },
    { name: "TSP", npk: "০-৪৬-০", color: "bg-chart-2", baseAmount: 50 },
    { name: "MOP", npk: "০-০-৬০", color: "bg-primary", baseAmount: 40 },
  ],
  chili: [
    { name: "ইউরিয়া", npk: "৪৬-০-০", color: "bg-chart-3", baseAmount: 100 },
    { name: "TSP", npk: "০-৪৬-০", color: "bg-chart-2", baseAmount: 70 },
    { name: "MOP", npk: "০-০-৬০", color: "bg-primary", baseAmount: 50 },
  ],
  garlic: [
    { name: "ইউরিয়া", npk: "৪৬-০-০", color: "bg-chart-3", baseAmount: 75 },
    { name: "TSP", npk: "০-৪৬-০", color: "bg-chart-2", baseAmount: 55 },
    { name: "MOP", npk: "০-০-৬০", color: "bg-primary", baseAmount: 55 },
    { name: "সালফার", npk: "০-০-০-০", color: "bg-chart-4", baseAmount: 6 },
  ],
  
  // মসলা/তেলবীজ
  mustard: [
    { name: "ইউরিয়া", npk: "৪৬-০-০", color: "bg-chart-3", baseAmount: 65 },
    { name: "TSP", npk: "০-৪৬-০", color: "bg-chart-2", baseAmount: 50 },
    { name: "MOP", npk: "০-০-৬০", color: "bg-primary", baseAmount: 30 },
    { name: "সালফার", npk: "০-০-০-০", color: "bg-chart-4", baseAmount: 10 },
  ],
  ginger: [
    { name: "ইউরিয়া", npk: "৪৬-০-০", color: "bg-chart-3", baseAmount: 120 },
    { name: "TSP", npk: "০-৪৬-০", color: "bg-chart-2", baseAmount: 80 },
    { name: "MOP", npk: "০-০-৬০", color: "bg-primary", baseAmount: 100 },
  ],
  turmeric: [
    { name: "ইউরিয়া", npk: "৪৬-০-০", color: "bg-chart-3", baseAmount: 110 },
    { name: "TSP", npk: "০-৪৬-০", color: "bg-chart-2", baseAmount: 75 },
    { name: "MOP", npk: "০-০-৬০", color: "bg-primary", baseAmount: 90 },
  ],
  coriander: [
    { name: "ইউরিয়া", npk: "৪৬-০-০", color: "bg-chart-3", baseAmount: 40 },
    { name: "TSP", npk: "০-৪৬-০", color: "bg-chart-2", baseAmount: 30 },
    { name: "MOP", npk: "০-০-৬০", color: "bg-primary", baseAmount: 20 },
  ],
  cumin: [
    { name: "ইউরিয়া", npk: "৪৬-০-০", color: "bg-chart-3", baseAmount: 35 },
    { name: "TSP", npk: "০-৪৬-০", color: "bg-chart-2", baseAmount: 28 },
    { name: "MOP", npk: "০-০-৬০", color: "bg-primary", baseAmount: 18 },
  ],
  sesame: [
    { name: "ইউরিয়া", npk: "৪৬-০-০", color: "bg-chart-3", baseAmount: 45 },
    { name: "TSP", npk: "০-৪৬-০", color: "bg-chart-2", baseAmount: 35 },
    { name: "MOP", npk: "০-০-৬০", color: "bg-primary", baseAmount: 25 },
  ],
  sunflower: [
    { name: "ইউরিয়া", npk: "৪৬-০-০", color: "bg-chart-3", baseAmount: 80 },
    { name: "TSP", npk: "০-৪৬-০", color: "bg-chart-2", baseAmount: 60 },
    { name: "MOP", npk: "০-০-৬০", color: "bg-primary", baseAmount: 40 },
    { name: "বোরন", npk: "০-০-০-০", color: "bg-chart-5", baseAmount: 2 },
  ],
  groundnut: [
    { name: "ইউরিয়া", npk: "৪৬-০-০", color: "bg-chart-3", baseAmount: 25 },
    { name: "TSP", npk: "০-৪৬-০", color: "bg-chart-2", baseAmount: 70 },
    { name: "MOP", npk: "০-০-৬০", color: "bg-primary", baseAmount: 40 },
    { name: "জিপসাম", npk: "০-০-০-১৮", color: "bg-chart-4", baseAmount: 80 },
  ],
  
  // ডাল
  lentil: [
    { name: "ইউরিয়া", npk: "৪৬-০-০", color: "bg-chart-3", baseAmount: 20 },
    { name: "TSP", npk: "০-৪৬-০", color: "bg-chart-2", baseAmount: 45 },
    { name: "MOP", npk: "০-০-৬০", color: "bg-primary", baseAmount: 25 },
  ],
  chickpea: [
    { name: "ইউরিয়া", npk: "৪৬-০-০", color: "bg-chart-3", baseAmount: 20 },
    { name: "TSP", npk: "০-৪৬-০", color: "bg-chart-2", baseAmount: 50 },
    { name: "MOP", npk: "০-০-৬০", color: "bg-primary", baseAmount: 30 },
  ],
  greenGram: [
    { name: "ইউরিয়া", npk: "৪৬-০-০", color: "bg-chart-3", baseAmount: 15 },
    { name: "TSP", npk: "০-৪৬-০", color: "bg-chart-2", baseAmount: 40 },
    { name: "MOP", npk: "০-০-৬০", color: "bg-primary", baseAmount: 20 },
  ],
  blackGram: [
    { name: "ইউরিয়া", npk: "৪৬-০-০", color: "bg-chart-3", baseAmount: 18 },
    { name: "TSP", npk: "০-৪৬-০", color: "bg-chart-2", baseAmount: 42 },
    { name: "MOP", npk: "০-০-৬০", color: "bg-primary", baseAmount: 22 },
  ],
  pigeonPea: [
    { name: "ইউরিয়া", npk: "৪৬-০-০", color: "bg-chart-3", baseAmount: 20 },
    { name: "TSP", npk: "০-৪৬-০", color: "bg-chart-2", baseAmount: 55 },
    { name: "MOP", npk: "০-০-৬০", color: "bg-primary", baseAmount: 30 },
  ],
  
  // ফল
  mango: [
    { name: "ইউরিয়া", npk: "৪৬-০-০", color: "bg-chart-3", baseAmount: 200 },
    { name: "TSP", npk: "০-৪৬-০", color: "bg-chart-2", baseAmount: 150 },
    { name: "MOP", npk: "০-০-৬০", color: "bg-primary", baseAmount: 200 },
    { name: "বোরন", npk: "০-০-০-০", color: "bg-chart-5", baseAmount: 5 },
  ],
  banana: [
    { name: "ইউরিয়া", npk: "৪৬-০-০", color: "bg-chart-3", baseAmount: 300 },
    { name: "TSP", npk: "০-৪৬-০", color: "bg-chart-2", baseAmount: 100 },
    { name: "MOP", npk: "০-০-৬০", color: "bg-primary", baseAmount: 350 },
  ],
  papaya: [
    { name: "ইউরিয়া", npk: "৪৬-০-০", color: "bg-chart-3", baseAmount: 180 },
    { name: "TSP", npk: "০-৪৬-০", color: "bg-chart-2", baseAmount: 120 },
    { name: "MOP", npk: "০-০-৬০", color: "bg-primary", baseAmount: 200 },
  ],
  guava: [
    { name: "ইউরিয়া", npk: "৪৬-০-০", color: "bg-chart-3", baseAmount: 150 },
    { name: "TSP", npk: "০-৪৬-০", color: "bg-chart-2", baseAmount: 100 },
    { name: "MOP", npk: "০-০-৬০", color: "bg-primary", baseAmount: 150 },
  ],
  lemon: [
    { name: "ইউরিয়া", npk: "৪৬-০-০", color: "bg-chart-3", baseAmount: 160 },
    { name: "TSP", npk: "০-৪৬-০", color: "bg-chart-2", baseAmount: 110 },
    { name: "MOP", npk: "০-০-৬০", color: "bg-primary", baseAmount: 180 },
    { name: "জিংক সালফেট", npk: "০-০-০-০", color: "bg-chart-4", baseAmount: 4 },
  ],
  watermelon: [
    { name: "ইউরিয়া", npk: "৪৬-০-০", color: "bg-chart-3", baseAmount: 100 },
    { name: "TSP", npk: "০-৪৬-০", color: "bg-chart-2", baseAmount: 70 },
    { name: "MOP", npk: "০-০-৬০", color: "bg-primary", baseAmount: 80 },
  ],
  jackfruit: [
    { name: "ইউরিয়া", npk: "৪৬-০-০", color: "bg-chart-3", baseAmount: 250 },
    { name: "TSP", npk: "০-৪৬-০", color: "bg-chart-2", baseAmount: 180 },
    { name: "MOP", npk: "০-০-৬০", color: "bg-primary", baseAmount: 220 },
  ],
  litchi: [
    { name: "ইউরিয়া", npk: "৪৬-০-০", color: "bg-chart-3", baseAmount: 180 },
    { name: "TSP", npk: "০-৪৬-০", color: "bg-chart-2", baseAmount: 140 },
    { name: "MOP", npk: "০-০-৬০", color: "bg-primary", baseAmount: 200 },
  ],
  
  // অন্যান্য
  jute: [
    { name: "ইউরিয়া", npk: "৪৬-০-০", color: "bg-chart-3", baseAmount: 60 },
    { name: "TSP", npk: "০-৪৬-০", color: "bg-chart-2", baseAmount: 24 },
    { name: "MOP", npk: "০-০-৬০", color: "bg-primary", baseAmount: 30 },
  ],
  sugarcane: [
    { name: "ইউরিয়া", npk: "৪৬-০-০", color: "bg-chart-3", baseAmount: 250 },
    { name: "TSP", npk: "০-৪৬-০", color: "bg-chart-2", baseAmount: 120 },
    { name: "MOP", npk: "০-০-৬০", color: "bg-primary", baseAmount: 150 },
  ],
  tea: [
    { name: "ইউরিয়া", npk: "৪৬-০-০", color: "bg-chart-3", baseAmount: 180 },
    { name: "TSP", npk: "০-৪৬-০", color: "bg-chart-2", baseAmount: 60 },
    { name: "MOP", npk: "০-০-৬০", color: "bg-primary", baseAmount: 80 },
  ],
  cotton: [
    { name: "ইউরিয়া", npk: "৪৬-০-০", color: "bg-chart-3", baseAmount: 100 },
    { name: "TSP", npk: "০-৪৬-০", color: "bg-chart-2", baseAmount: 60 },
    { name: "MOP", npk: "০-০-৬০", color: "bg-primary", baseAmount: 50 },
  ],
  tobacco: [
    { name: "ইউরিয়া", npk: "৪৬-০-০", color: "bg-chart-3", baseAmount: 80 },
    { name: "TSP", npk: "০-৪৬-০", color: "bg-chart-2", baseAmount: 70 },
    { name: "MOP", npk: "০-০-৬০", color: "bg-primary", baseAmount: 120 },
  ],
};

const warnings = [
  "ইউরিয়া + TSP একসাথে দেবেন না",
  "ভেজা মাটিতে ইউরিয়া দিলে গ্যাস হয়ে উড়ে যায়",
  "অতিরিক্ত সার ফসলের ক্ষতি করে",
  "সার দেওয়ার পর হালকা সেচ দিন",
  "ডাল জাতীয় ফসলে কম ইউরিয়া দিন",
];

export default function NPKCalculatorPage() {
  const [selectedCrop, setSelectedCrop] = useState("rice");
  const [landSize, setLandSize] = useState("2.5");
  const [isEditing, setIsEditing] = useState(false);

  const landSizeNum = parseFloat(landSize) || 0;
  const currentFertilizers = baseFertilizers[selectedCrop] || baseFertilizers.rice;

  const calculateAmount = (baseAmount: number) => {
    const amount = baseAmount * landSizeNum;
    return amount.toFixed(1);
  };

  const getSchedule = () => {
    const totalUrea = (currentFertilizers.find(f => f.name === "ইউরিয়া")?.baseAmount || 80) * landSizeNum;
    const tsp = (currentFertilizers.find(f => f.name === "TSP")?.baseAmount || 40) * landSizeNum;
    const mop = (currentFertilizers.find(f => f.name === "MOP")?.baseAmount || 30) * landSizeNum;
    
    return [
      { stage: "বীজ বপনের সময়", day: "০ দিন", fertilizer: "TSP + MOP সম্পূর্ণ", amount: `${tsp.toFixed(0)}+${mop.toFixed(0)} কেজি` },
      { stage: "প্রথম কিস্তি", day: "১৫-২০ দিন", fertilizer: "ইউরিয়া ১/৩", amount: `${(totalUrea / 3).toFixed(0)} কেজি` },
      { stage: "দ্বিতীয় কিস্তি", day: "৩০-৩৫ দিন", fertilizer: "ইউরিয়া ১/৩", amount: `${(totalUrea / 3).toFixed(0)} কেজি` },
      { stage: "তৃতীয় কিস্তি", day: "৪৫-৫০ দিন", fertilizer: "ইউরিয়া ১/৩", amount: `${(totalUrea / 3).toFixed(0)} কেজি` },
    ];
  };

  return (
    <div className="min-h-screen pb-24 relative">
      {/* Background */}
      <div 
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: `url(${villageBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-background/90 backdrop-blur-sm" />
      </div>

      {/* Header */}
      <header className="bg-card/80 backdrop-blur-md border-b border-border px-4 py-4">
        <div className="flex items-center gap-3">
          <Link to="/home">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Calculator className="w-5 h-5 text-primary" />
              সার ক্যালকুলেটর
            </h1>
            <p className="text-xs text-muted-foreground">সরকারি গাইডলাইন + NPK ব্যালেন্স</p>
          </div>
        </div>
      </header>

      {/* Crop Selection */}
      <section className="px-4 py-4">
        <h2 className="text-sm font-semibold text-foreground mb-2">ফসল নির্বাচন করুন ({crops.length}টি ফসল)</h2>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {crops.map((crop) => (
            <button
              key={crop.id}
              onClick={() => setSelectedCrop(crop.id)}
              className={cn(
                "flex-shrink-0 px-3 py-2 rounded-xl border flex items-center gap-2 transition-all backdrop-blur-sm text-sm",
                selectedCrop === crop.id 
                  ? "bg-secondary/20 border-secondary text-secondary" 
                  : "bg-card/80 border-border text-foreground"
              )}
            >
              <span>{crop.emoji}</span>
              <span>{crop.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Land Size Input */}
      <section className="px-4 mb-4">
        <div className="bg-card/80 backdrop-blur-sm border border-border rounded-xl p-4">
          <h3 className="text-sm font-semibold text-foreground mb-2">জমির পরিমাণ</h3>
          {isEditing ? (
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={landSize}
                onChange={(e) => setLandSize(e.target.value)}
                className="flex-1 text-center text-xl font-bold"
                min="0.1"
                step="0.1"
                autoFocus
              />
              <span className="text-sm text-muted-foreground">একর</span>
              <Button 
                onClick={() => setIsEditing(false)}
                className="bg-secondary text-secondary-foreground"
              >
                হিসাব করুন
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-muted rounded-lg px-4 py-3 text-center">
                <span className="text-2xl font-bold text-foreground">{landSize}</span>
                <span className="text-sm text-muted-foreground ml-1">একর</span>
              </div>
              <Button 
                variant="outline" 
                onClick={() => setIsEditing(true)}
              >
                পরিবর্তন
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* NPK Requirement */}
      <section className="px-4 mb-4">
        <h2 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
          <Leaf className="w-4 h-4 text-secondary" />
          প্রয়োজনীয় সার ({landSize} একর)
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {currentFertilizers.map((fert, idx) => (
            <div key={idx} className="bg-card/80 backdrop-blur-sm border border-border rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className={cn("w-3 h-3 rounded-full", fert.color)} />
                <span className="text-sm font-medium text-foreground">{fert.name}</span>
              </div>
              <p className="text-xl font-bold text-foreground">{calculateAmount(fert.baseAmount)} কেজি</p>
              <p className="text-xs text-muted-foreground">NPK: {fert.npk}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Application Schedule */}
      <section className="px-4 mb-4">
        <h2 className="text-base font-semibold text-foreground mb-3">প্রয়োগের সময়সূচি</h2>
        <div className="space-y-2">
          {getSchedule().map((item, idx) => (
            <div key={idx} className="bg-card/80 backdrop-blur-sm border border-border rounded-xl p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center text-secondary font-bold text-sm">
                {idx + 1}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{item.stage}</p>
                <p className="text-xs text-muted-foreground">{item.day} • {item.fertilizer}</p>
              </div>
              <span className="text-xs bg-muted text-foreground px-2 py-1 rounded-lg">{item.amount}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Warnings */}
      <section className="px-4 mb-4">
        <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 backdrop-blur-sm">
          <h3 className="text-sm font-semibold text-destructive mb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            সতর্কতা
          </h3>
          <ul className="space-y-1.5">
            {warnings.map((warning, idx) => (
              <li key={idx} className="text-xs text-destructive/80 flex items-start gap-2">
                <span>⚠️</span>
                {warning}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Government Source */}
      <section className="px-4">
        <div className="bg-card/80 backdrop-blur-sm border border-border rounded-xl p-3 flex items-center gap-2">
          <Info className="w-4 h-4 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            তথ্যসূত্র: বাংলাদেশ কৃষি গবেষণা ইনস্টিটিউট (BARI) ও DAE
          </p>
        </div>
      </section>
    </div>
  );
}