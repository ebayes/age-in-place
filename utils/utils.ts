import {
  Bath,
  Bed,
  Car,
  RockingChair,
  CookingPot,
  Home,
  Layers,
  LucideIcon,
  Sofa,
  // Stairs,
  Sun,
  UtensilsCrossed,
  WashingMachine,
  DoorOpenIcon,
  DoorClosedIcon,
} from 'lucide-react';

export function getIcon(roomName: string): LucideIcon {
  switch (roomName.toLowerCase()) {
    case 'living_room':
      return Sofa;
    case 'kitchen':
      return CookingPot;
    case 'bedroom':
      return Bed;
    case 'dining_room':
      return UtensilsCrossed;
    case 'bathroom':
      return Bath;
    case 'staircase':
      return Home;
    case 'hallway':
      return DoorOpenIcon;
    case 'entryway':
      return DoorClosedIcon;
    case 'basement':
      return Layers;
    case 'laundry_room':
      return WashingMachine;
    case 'garage':
      return Car;
    case 'front_porch':
      return Sun;
    case 'deck':
      return RockingChair;
    default:
      return Home;
  }
}
  
  export function formatRoomName(name: string): string {
    let formattedName = name.replace(/_/g, ' ');
    formattedName = formattedName.charAt(0).toUpperCase() + formattedName.slice(1);
    return formattedName;
  }