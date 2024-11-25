import { ReportRecord } from "@/types/report";

export const dummyImages = [
    "https://bjuozchwgphxqrkjekpq.supabase.co/storage/v1/object/public/rooms/1732405163275-kitchen.png",
    "https://bjuozchwgphxqrkjekpq.supabase.co/storage/v1/object/public/rooms/1732405163276-kitchen_2.png"
]
   
export const dummyAnnotations = [
    {
      "frameWidth": 768,
      "frameHeight": 576,
      "boundingBoxes": [
        {
          "bboxes": [
            [
              3,
              288,
              237,
              149
            ] as [number, number, number, number]
          ],
          "phrase": "the area under the kitchen sink",
          "confidence": [
            0.5820918083190918
          ]
        },
        {
          "bboxes": [
            [
              399,
              291,
              165,
              154
            ] as [number, number, number, number]
          ],
          "phrase": "the stove area next to the refrigerator on the right side",
          "confidence": [
            0.4706577956676483
          ]
        },
        {
          "bboxes": [
            [
              13,
              130,
              211,
              166
            ] as [number, number, number, number]
          ],
          "phrase": "the cupboard doors in the kitchen",
          "confidence": [
            0.3673476278781891
          ]
        },
        {
          "bboxes": [
            [
              3,
              288,
              237,
              149
            ] as [number, number, number, number],
            [
              3,
              284,
              232,
              32
            ] as [number, number, number, number],
            [
              190,
              333,
              229,
              92
            ] as [number, number, number, number]
          ],
          "phrase": "the kitchen area near the sink on the left side",
          "confidence": [
            0.34678521752357483,
            0.3761328160762787,
            0.48343387246131897
          ]
        },
        {
          "bboxes": [
            [
              6,
              308,
              147,
              129
            ] as [number, number, number, number]
          ],
          "phrase": "the wooden cart on the right side near the window",
          "confidence": [
            0.32527977228164673
          ]
        },
        {
          "bboxes": [
            [
              3,
              280,
              239,
              45
            ] as [number, number, number, number],
            [
              3,
              288,
              237,
              149
            ] as [number, number, number, number],
            [
              3,
              284,
              232,
              32
            ] as [number, number, number, number]
          ],
          "phrase": "the countertop area next to the stove",
          "confidence": [
            0.3122689127922058,
            0.35343003273010254,
            0.6371297240257263
          ]
        }
      ],
      "modifications": [
        {
          "location": "the kitchen area near the sink on the left side",
          "product_id": "motion-sensor lighting",
          "modification": "Install motion-sensor lighting to provide illumination automatically when the area is in use."
        },
        {
          "location": "the stove area next to the refrigerator on the right side",
          "product_id": "stove safety knob covers",
          "modification": "Add stove safety knob covers to prevent accidental activation of the stove."
        },
        {
          "location": "the countertop area next to the stove",
          "product_id": "lever-style faucet handles",
          "modification": "Install lever-style faucet handles for easier grip and use."
        },
        {
          "location": "the cupboard doors in the kitchen, particularly those within arm's reach",
          "product_id": "easy-grip cabinet handles",
          "modification": "Replace existing handles with easy-grip cabinet handles for ease of opening."
        },
        {
          "location": "the area under the kitchen sink",
          "product_id": "pull-out drawers",
          "modification": "Introduce pull-out drawers to make less accessible items more reachable."
        },
        {
          "location": "the wooden cart on the right side near the window",
          "product_id": "anti-slip step stools",
          "modification": "Consider adding anti-slip step stools to help reach higher items safely."
        }
      ]
    },
    {
      "frameWidth": 1024,
      "frameHeight": 683,
      "boundingBoxes": [
        {
          "bboxes": [
            [
              853,
              194,
              166,
              340
            ] as [number, number, number, number]
          ],
          "phrase": "the entryway door area",
          "confidence": [
            0.7925890684127808
          ]
        },
        {
          "bboxes": [
            [
              496,
              341,
              344,
              180
            ] as [number, number, number, number],
            [
              384,
              408,
              341,
              264
            ] as [number, number, number, number]
          ],
          "phrase": "the kitchen area",
          "confidence": [
            0.4184403419494629,
            0.4526289403438568
          ]
        },
        {
          "bboxes": [
            [
              496,
              341,
              344,
              180
            ] as [number, number, number, number],
            [
              384,
              408,
              341,
              264
            ] as [number, number, number, number]
          ],
          "phrase": "the kitchen area near the dining table with black and yellow table",
          "confidence": [
            0.3996252715587616,
            0.4613507390022278
          ]
        },
        {
          "bboxes": [
            [
              385,
              408,
              337,
              125
            ] as [number, number, number, number],
            [
              499,
              340,
              338,
              40
            ] as [number, number, number, number],
            [
              385,
              409,
              334,
              102
            ] as [number, number, number, number]
          ],
          "phrase": "the countertop next to the sink",
          "confidence": [
            0.3382193446159363,
            0.34934622049331665,
            0.3539668023586273
          ]
        },
        {
          "bboxes": [
            [
              384,
              408,
              341,
              264
            ] as [number, number, number, number],
            [
              692,
              373,
              92,
              134
            ] as [number, number, number, number]
          ],
          "phrase": "under the kitchen sink and near the dishwasher",
          "confidence": [
            0.3221355080604553,
            0.600369930267334
          ]
        }
      ],
      "modifications": [
        {
          "location": "the kitchen area near the dining table with black and yellow table",
          "product_id": "easy-grip cabinet handles",
          "modification": "Replace the chairs with easy-to-access chairs that have armrests for better support when sitting and standing."
        },
        {
          "location": "under the kitchen sink and near the dishwasher",
          "product_id": "pull-out drawers",
          "modification": "Install pull-out drawers for easier access to pots and pans stored in lower cabinets."
        },
        {
          "location": "the countertop next to the sink",
          "product_id": "lever-style faucet handles",
          "modification": "Add lever-style faucet handles for easier operation, especially for those with limited hand strength."
        },
        {
          "location": "the entryway door area",
          "product_id": "non-slip rugs",
          "modification": "Install anti-slip mats in front of the doors to prevent slipping when entering or exiting the space."
        },
        {
          "location": "the kitchen area, specifically above the countertop and sink",
          "product_id": "motion-sensor lighting",
          "modification": "Install motion-sensor lighting to ensure the area is well-lit without the need for manual switches."
        }
      ]
    }
]

export const dummyProducts = {
  "motion-sensor lighting": {
      name: "Motion Sensor Light",
      description: "Automatic LED lighting that activates when movement is detected",
      price: 29.99,
      category: "Lighting",
      image_url: "https://m.media-amazon.com/images/I/416Xx9INusL._AC_SL1000_.jpg"
  },
  "stove safety knob covers": {
      name: "Stove Safety Knob Covers",
      description: "Protective covers to prevent accidental stove activation",
      price: 14.99,
      category: "Kitchen Safety",
      image_url: "https://m.media-amazon.com/images/I/517bRnP0W7L._SX300_SY300_QL70_FMwebp_.jpg"
  },
  "lever-style faucet handles": {
      name: "Lever Faucet Handle",
      description: "Easy-to-use lever handle for better grip and control",
      price: 39.99,
      category: "Plumbing",
      image_url: "https://m.media-amazon.com/images/I/71fFybaxNzL._AC_UL640_FMwebp_QL65_.jpg"
  },
  "easy-grip cabinet handles": {
      name: "Easy Grip Cabinet Handle",
      description: "Ergonomic handles for easier cabinet access",
      price: 8.99,
      category: "Hardware",
      image_url: "https://m.media-amazon.com/images/I/61k78oVMbeL._AC_UL640_FMwebp_QL65_.jpg"
  },
  "pull-out drawers": {
      name: "Pull-Out Cabinet Drawer",
      description: "Sliding drawer system for better accessibility",
      price: 89.99,
      category: "Storage",
      image_url: "https://m.media-amazon.com/images/I/812ou+KomvL._AC_UL640_FMwebp_QL65_.jpg"
  },
  "anti-slip step stools": {
      name: "Anti-Slip Step Stool",
      description: "Stable step stool with non-slip surface",
      price: 34.99,
      category: "Mobility",
      image_url: "https://m.media-amazon.com/images/I/51bLZyKGteL._AC_UL640_FMwebp_QL65_.jpg"
  },
  "non-slip rugs": {
      name: "Non-Slip Area Rug",
      description: "Safety-enhanced rug with non-slip backing",
      price: 49.99,
      category: "Floor Safety",
      image_url: "https://m.media-amazon.com/images/I/81KsL8PUGVL._AC_UL640_FMwebp_QL65_.jpg"
  }
};

export const dummyReport: ReportRecord = {
  user_id: "demo_user",
  reports: {
      relationship: "Parent/Grandparent",
      firstName: "Jane",
      lastName: "Smith",
      overallHealth: "Good",
      healthDetails: "Generally healthy but experiencing some mobility challenges due to arthritis",
      homeDetails: "Two-story home with main living areas on the first floor",
      bathingAssistance: "Sometimes",
      householdAssistance: ["Cleaning", "Laundry", "Meal Preparation"],
      medicationAssistance: "No",
      mobilityIndoors: "With support",
      mobilityDevices: ["Walker", "Handrails"],
      recentFalls: "Yes",
      fallDetails: "One minor fall in the bathroom three months ago",
      safetyDevices: ["Grab Bars", "Night Lights"],
      budget: [1000, 5000]
  },
  report_lines: [
      {
          title: "Executive Summary",
          content: "Based on our comprehensive assessment of Jane Smith's living situation, we've identified several key areas for improvement to enhance safety and comfort for aging in place. The primary focus areas include bathroom safety modifications, improved lighting systems, and mobility support throughout the home."
      },
      {
          title: "Health Assessment",
          content: "Jane maintains good overall health but faces mobility challenges due to arthritis. These challenges particularly affect her ability to navigate certain areas of the home and perform daily activities. Current mobility aids include a walker and installed handrails, which have proven beneficial."
      },
      {
          title: "Home Environment",
          content: "The two-story home presents some challenges, though main living areas are advantageously located on the first floor. Key modification areas include:\n\n- Bathroom safety enhancements\n- Improved lighting systems\n- Additional mobility support fixtures\n- Kitchen accessibility modifications"
      },
      {
          title: "Care Requirements",
          content: "Current assistance needs focus on:\n\n- Occasional bathing support\n- Regular household tasks (cleaning, laundry, meal preparation)\n- No medication management required\n- Mobility support for certain activities"
      },
      {
          title: "Safety Analysis",
          content: "Recent fall history indicates the need for enhanced safety measures. Priority areas include:\n\n1. Bathroom safety upgrades\n2. Improved lighting in transition areas\n3. Additional support fixtures in key locations\n4. Non-slip surface treatments"
      },
      {
          title: "Budget Considerations",
          content: "With a budget range of $1,000-$5,000, we recommend a phased approach to modifications:\n\n- Phase 1: Critical safety modifications (bathroom, lighting)\n- Phase 2: Mobility support enhancements\n- Phase 3: Comfort and accessibility improvements"
      }
  ]
};