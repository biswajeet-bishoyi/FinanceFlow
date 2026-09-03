/**
 * Maps category names and legacy/Lucide icon strings to guaranteed valid Google Material Symbols icon names.
 */
export function getCategoryIcon(icon?: string | null, name?: string | null): string {
  const iconLower = (icon || "").toLowerCase().trim();
  const nameLower = (name || "").toLowerCase().trim();

  // Explicit mappings for common icon strings
  const iconMap: Record<string, string> = {
    // Food & Dining
    pizza: "restaurant",
    restaurant: "restaurant",
    food: "restaurant",
    cafe: "local_cafe",
    coffee: "local_cafe",
    fastfood: "fastfood",
    dining: "lunch_dining",

    // Travel & Transport
    bus: "directions_bus",
    car: "directions_car",
    transport: "commute",
    train: "train",
    metro: "subway",
    fuel: "local_gas_station",
    flight: "flight",

    // Money & Income
    coins: "payments",
    money: "payments",
    cash: "payments",
    wallet: "account_balance_wallet",
    pocket_money: "payments",
    salary: "paid",
    savings: "savings",
    bank: "account_balance",

    // Entertainment & Leisure
    film: "movie",
    movie: "movie",
    theaters: "theaters",
    game: "sports_esports",
    music: "headphones",
    party: "celebration",

    // Personal & Lifestyle
    user: "person",
    person: "person",
    self: "person",
    fitness: "fitness_center",
    gym: "fitness_center",
    health: "medical_services",
    medicine: "medication",

    // Home & Hostel
    home: "home",
    hostel: "home",
    rent: "holiday_village",
    room: "bedroom_parent",

    // College & Education
    book: "school",
    school: "school",
    college: "school",
    study: "menu_book",
    exam: "edit_document",

    // Shopping & Bills
    shopping: "shopping_bag",
    shopping_bag: "shopping_bag",
    grocery: "local_grocery_store",
    cart: "shopping_cart",
    bills: "receipt",
    bill: "receipt",
    receipt: "receipt",
    wifi: "wifi",
    recharge: "smartphone",
    subscriptions: "subscriptions",
  };

  if (iconLower && iconMap[iconLower]) {
    return iconMap[iconLower];
  }

  // Fallback by category name
  if (nameLower) {
    if (nameLower.includes("food") || nameLower.includes("lunch") || nameLower.includes("dinner") || nameLower.includes("chai") || nameLower.includes("snack")) return "restaurant";
    if (nameLower.includes("transport") || nameLower.includes("bus") || nameLower.includes("auto") || nameLower.includes("cab") || nameLower.includes("metro")) return "directions_bus";
    if (nameLower.includes("college") || nameLower.includes("book") || nameLower.includes("fee") || nameLower.includes("study") || nameLower.includes("course")) return "school";
    if (nameLower.includes("entertainment") || nameLower.includes("movie") || nameLower.includes("film") || nameLower.includes("game")) return "movie";
    if (nameLower.includes("pocket money") || nameLower.includes("income") || nameLower.includes("allowance") || nameLower.includes("salary")) return "payments";
    if (nameLower.includes("hostel") || nameLower.includes("rent") || nameLower.includes("room")) return "home";
    if (nameLower.includes("shopping") || nameLower.includes("cloth") || nameLower.includes("amazon") || nameLower.includes("flipkart")) return "shopping_bag";
    if (nameLower.includes("bill") || nameLower.includes("wifi") || nameLower.includes("electricity") || nameLower.includes("recharge")) return "receipt";
    if (nameLower.includes("personal") || nameLower.includes("self")) return "person";
    if (nameLower.includes("health") || nameLower.includes("medicine") || nameLower.includes("doctor")) return "medical_services";
  }

  return iconLower || "receipt";
}
