export interface MotivationItem {
  id: number;
  youtubeId?: string;
  message: {
    ar: string;
    fr: string;
    en: string;
  };
  quran?: {
    ar: string;
    fr: string;
    en: string;
    source: string;
  };
  hadith?: {
    ar: string;
    fr: string;
    en: string;
    source: string;
  };
  citation: {
    ar: string;
    fr: string;
    en: string;
  };
}

export const MOTIVATION_DATA: MotivationItem[] = [
  {
    id: 1,
    youtubeId: "Wiv_Ld1WjIs",
    message: {
      ar: "مجهود صغير اليوم = نجاح كبير غداً",
      fr: "Petit effort aujourd'hui = grande réussite demain",
      en: "Small effort today = big success tomorrow"
    },
    quran: {
      ar: "وَقُلِ اعْمَلُوا فَسَيَرَى اللَّهُ عَمَلَكُمْ",
      fr: "Et dis : 'Œuvrez, car Allah va voir votre œuvre'",
      en: "And say, 'Do [as you will], for Allah will see your deeds'",
      source: "Sourate At-Tawbah, 105"
    },
    hadith: {
      ar: "إِنَّ اللَّهَ يُحِبُّ إِذَا عَمِلَ أَحَدُكُمْ عَمَلًا أَنْ يُتْقِنَهُ",
      fr: "Allah aime, lorsque l'un de vous accomplit un travail, qu'il le fasse avec excellence",
      en: "Allah loves that when one of you does a job, he does it with excellence",
      source: "Al-Mu'jam al-Awsat"
    },
    citation: {
      ar: "الاستمرارية هي مفتاح النجاح",
      fr: "La persévérance est la clé du succès",
      en: "Perseverance is the key to success"
    }
  },
  {
    id: 2,
    youtubeId: "v8f9-4zH7nU",
    message: {
      ar: "كل خطوة تقربك من حلمك",
      fr: "Chaque pas te rapproche de ton rêve",
      en: "Every step brings you closer to your dream"
    },
    quran: {
      ar: "وَأَن لَّيْسَ لِلْإِنسَانِ إِلَّا مَا سَعَىٰ",
      fr: "Et qu'en vérité, l'homme n'obtient que le fruit de ses efforts",
      en: "And that there is not for man except that [good] for which he strives",
      source: "Sourate An-Najm, 39"
    },
    hadith: {
      ar: "مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ",
      fr: "Celui qui emprunte un chemin pour rechercher la science, Allah lui facilite un chemin vers le Paradis",
      en: "Whoever follows a path in pursuit of knowledge, Allah will make easy for him a path to Paradise",
      source: "Sahih Muslim"
    },
    citation: {
      ar: "لا تتوقف عندما تتعب، توقف عندما تنتهي",
      fr: "Ne t'arrête pas quand tu es fatigué, arrête-toi quand tu as fini",
      en: "Don't stop when you're tired, stop when you're done"
    }
  },
  {
    id: 3,
    youtubeId: "qR33bW_a_Jg",
    message: {
      ar: "أنت أقوى مما تعتقد",
      fr: "Tu es plus fort que tu ne le penses",
      en: "You are stronger than you think"
    },
    quran: {
      ar: "لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا",
      fr: "Allah n'impose à aucune âme une charge supérieure à sa capacité",
      en: "Allah does not charge a soul except [with that within] its capacity",
      source: "Sourate Al-Baqarah, 286"
    },
    hadith: {
      ar: "الْمُؤْمِنُ الْقَوِيُّ خَيْرٌ وَأَحَبُّ إِلَى اللَّهِ مِنَ الْمُؤْمِنِ الضَّعِيفِ",
      fr: "Le croyant fort est meilleur et plus aimé d'Allah que le croyant faible",
      en: "A strong believer is better and more beloved to Allah than a weak believer",
      source: "Sahih Muslim"
    },
    citation: {
      ar: "النجاح هو مجموع الجهود الصغيرة المتكررة",
      fr: "Le succès est la somme de petits efforts répétés",
      en: "Success is the sum of small efforts repeated"
    }
  },
  {
    id: 4,
    youtubeId: "_9Y9a2sP1hU",
    message: {
      ar: "اجعل اليوم بداية جديدة",
      fr: "Fais d'aujourd'hui un nouveau départ",
      en: "Make today a new beginning"
    },
    quran: {
      ar: "إِنَّ مَعَ الْعُسْرِ يُسْرًا",
      fr: "Certes, avec la difficulté, il y a une facilité",
      en: "Indeed, with hardship [will be] ease",
      source: "Sourate Ash-Sharh, 6"
    },
    hadith: {
      ar: "احْرِصْ عَلَى مَا يَنْفَعُكَ وَاسْتَعِنْ بِاللَّهِ وَلَا تَعْجَزْ",
      fr: "Recherche avec ardeur ce qui te profite, demande l'aide d'Allah et ne faiblis pas",
      en: "Cherish that which gives you benefit, seek help from Allah and do not lose heart",
      source: "Sahih Muslim"
    },
    citation: {
      ar: "المستقبل يخص أولئك الذين يؤمنون بجمال أحلامهم",
      fr: "L'avenir appartient à ceux qui croient en la beauté de leurs rêves",
      en: "The future belongs to those who believe in the beauty of their dreams"
    }
  },
  {
    id: 5,
    message: {
      ar: "الصبر مفتاح الفرج والنجاح",
      fr: "La patience est la clé de la délivrance et du succès",
      en: "Patience is the key to relief and success"
    },
    quran: {
      ar: "إِنَّ اللَّهَ مَعَ الصَّابِرِينَ",
      fr: "Certes, Allah est avec les endurants",
      en: "Indeed, Allah is with the patient",
      source: "Sourate Al-Baqarah, 153"
    },
    hadith: {
      ar: "وَمَا أُعْطِيَ أَحَدٌ عَطَاءً خَيْرًا وَأَوْسَعَ مِنَ الصَّبْرِ",
      fr: "Nul n'a reçu de don meilleur et plus vaste que la patience",
      en: "No one is given a gift better and more extensive than patience",
      source: "Sahih Bukhari"
    },
    citation: {
      ar: "الصبر مر، ولكن ثمرته حلوة",
      fr: "La patience est amère, mais son fruit est doux",
      en: "Patience is bitter, but its fruit is sweet"
    }
  },
  {
    id: 6,
    message: {
      ar: "ثق بنفسك وبقدراتك",
      fr: "Aie confiance en toi et en tes capacités",
      en: "Believe in yourself and your abilities"
    },
    quran: {
      ar: "فَإِذَا عَزَمْتَ فَتَوَكَّلْ عَلَى اللَّهِ",
      fr: "Puis une fois que tu t'es décidé, confie-toi donc à Allah",
      en: "And when you have decided, then rely upon Allah",
      source: "Sourate Al-Imran, 159"
    },
    hadith: {
      ar: "لَوْ أَنَّكُمْ تَتَوَكَّلُونَ عَلَى اللَّهِ حَقَّ تَوَكُّلِهِ لَرَزَقَكُمْ كَمَا يَرْزُقُ الطَّيْرَ",
      fr: "Si vous vous en remettiez à Allah comme il se doit, Il vous accorderait votre subsistance comme Il l'accorde aux oiseaux",
      en: "If you were to rely upon Allah with the reliance He is due, He would provide for you just as He provides for the birds",
      source: "Sunan al-Tirmidhi"
    },
    citation: {
      ar: "الثقة بالنفس هي أول سر من أسرار النجاح",
      fr: "La confiance en soi est le premier secret du succès",
      en: "Self-confidence is the first secret of success"
    }
  },
  {
    id: 7,
    message: {
      ar: "العلم نور يضيء طريقك",
      fr: "La science est une lumière qui éclaire ton chemin",
      en: "Knowledge is a light that illuminates your path"
    },
    quran: {
      ar: "وَقُل رَّبِّ زِدْنِي عِلْمًا",
      fr: "Et dis : 'Ô mon Seigneur, accroît mes connaissances !'",
      en: "And say, 'My Lord, increase me in knowledge'",
      source: "Sourate Ta-Ha, 114"
    },
    hadith: {
      ar: "طَلَبُ الْعِلْمِ فَرِيضَةٌ عَلَى كُلِّ مُسْلِمٍ",
      fr: "La recherche de la science est une obligation pour chaque musulman",
      en: "Seeking knowledge is a duty upon every Muslim",
      source: "Sunan Ibn Majah"
    },
    citation: {
      ar: "التعليم هو أقوى سلاح يمكنك استخدامه لتغيير العالم",
      fr: "L'éducation est l'arme la plus puissante pour changer le monde",
      en: "Education is the most powerful weapon which you can use to change the world"
    }
  },
  {
    id: 8,
    message: {
      ar: "لا تستسلم أبداً",
      fr: "N'abandonne jamais",
      en: "Never give up"
    },
    quran: {
      ar: "وَلَا تَيْأَسُوا مِن رَّوْحِ اللَّهِ",
      fr: "Et ne désespérez pas de la miséricorde d'Allah",
      en: "And despair not of relief from Allah",
      source: "Sourate Yusuf, 87"
    },
    hadith: {
      ar: "يَسِّرُوا وَلَا تُعَسِّرُوا وَبَشِّرُوا وَلَا تُنَفِّرُوا",
      fr: "Facilitez les choses et ne les rendez pas difficiles, annoncez de bonnes nouvelles et ne faites pas fuir les gens",
      en: "Make things easy and do not make them difficult, give glad tidings and do not repel people",
      source: "Sahih Bukhari"
    },
    citation: {
      ar: "الفشل هو مجرد فرصة للبدء من جديد بذكاء أكبر",
      fr: "L'échec n'est qu'une opportunité de recommencer plus intelligemment",
      en: "Failure is simply the opportunity to begin again, this time more intelligently"
    }
  },
  {
    id: 9,
    message: {
      ar: "كل يوم هو فرصة للتعلم",
      fr: "Chaque jour est une opportunité d'apprendre",
      en: "Every day is an opportunity to learn"
    },
    quran: {
      ar: "يَرْفَعِ اللَّهُ الَّذِينَ آمَنُوا مِنكُمْ وَالَّذِينَ أُوتُوا الْعِلْمَ دَرَجَاتٍ",
      fr: "Allah élèvera en degrés ceux d'entre vous qui auront cru et ceux qui auront reçu le savoir",
      en: "Allah will raise those who have believed among you and those who were given knowledge, by degrees",
      source: "Sourate Al-Mujadila, 11"
    },
    hadith: {
      ar: "خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ",
      fr: "Le meilleur d'entre vous est celui qui apprend le Coran et l'enseigne",
      en: "The best of you is he who learns the Quran and teaches it",
      source: "Sahih Bukhari"
    },
    citation: {
      ar: "التعلم لا ينتهي أبداً",
      fr: "L'apprentissage ne s'arrête jamais",
      en: "Learning never exhausts the mind"
    }
  },
  {
    id: 10,
    message: {
      ar: "ركز على أهدافك",
      fr: "Concentre-toi sur tes objectifs",
      en: "Focus on your goals"
    },
    quran: {
      ar: "فَاسْتَبِقُوا الْخَيْرَاتِ",
      fr: "Rivalisez donc dans les bonnes œuvres",
      en: "So race to [all that is] good",
      source: "Sourate Al-Baqarah, 148"
    },
    hadith: {
      ar: "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ",
      fr: "Les actions ne valent que par les intentions",
      en: "Actions are but by intentions",
      source: "Sahih Bukhari"
    },
    citation: {
      ar: "التركيز هو سر القوة",
      fr: "La concentration est le secret de la force",
      en: "Concentration is the secret of strength"
    }
  },
  {
    id: 11,
    message: {
      ar: "أنت قادر على تحقيق المستحيل",
      fr: "Tu es capable de réaliser l'impossible",
      en: "You are capable of achieving the impossible"
    },
    quran: {
      ar: "إِنَّ اللَّهَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ",
      fr: "Certes, Allah est Omnipotent",
      en: "Indeed, Allah is over all things competent",
      source: "Sourate Al-Baqarah, 20"
    },
    hadith: {
      ar: "الْمُؤْمِنُ لِلْمُؤْمِنِ كَالْبُنْيَانِ يَشُدُّ بَعْضُهُ بَعْضًا",
      fr: "Le croyant est pour le croyant comme un édifice dont les briques se soutiennent les unes les autres",
      en: "A believer to another believer is like a building whose different parts enforce each other",
      source: "Sahih Bukhari"
    },
    citation: {
      ar: "لا شيء مستحيل للقلب المؤمن",
      fr: "Rien n'est impossible à un cœur croyant",
      en: "Nothing is impossible to a willing heart"
    }
  },
  {
    id: 12,
    message: {
      ar: "الوقت من ذهب",
      fr: "Le temps, c'est de l'or",
      en: "Time is gold"
    },
    quran: {
      ar: "وَالْعَصْرِ * إِنَّ الْإِنسَانَ لَفِي خُسْرٍ",
      fr: "Par le Temps ! L'homme est certes, en perdition",
      en: "By time, Indeed, mankind is in loss",
      source: "Sourate Al-Asr, 1-2"
    },
    hadith: {
      ar: "نِعْمَتَانِ مَغْبُونٌ فِيهِمَا كَثِيرٌ مِنَ النَّاسِ الصِّحَّةُ وَالْفَرَاغُ",
      fr: "Deux bienfaits sont négligés par beaucoup de gens : la santé et le temps libre",
      en: "There are two blessings which many people lose: health and free time",
      source: "Sahih Bukhari"
    },
    citation: {
      ar: "الوقت الذي تستمتع بإضاعته ليس وقتاً ضائعاً",
      fr: "Le temps que tu aimes perdre n'est pas du temps perdu",
      en: "Time you enjoy wasting is not wasted time"
    }
  },
  {
    id: 13,
    message: {
      ar: "كن إيجابياً دائماً",
      fr: "Sois toujours positif",
      en: "Always be positive"
    },
    quran: {
      ar: "وَبَشِّرِ الصَّابِرِينَ",
      fr: "Et fais la bonne annonce aux endurants",
      en: "And give good tidings to the patient",
      source: "Sourate Al-Baqarah, 155"
    },
    hadith: {
      ar: "الْكَلِمَةُ الطَّيِّبَةُ صَدَقَةٌ",
      fr: "Une bonne parole est une aumône",
      en: "A good word is a charity",
      source: "Sahih Bukhari"
    },
    citation: {
      ar: "التفاؤل هو الإيمان الذي يؤدي إلى الإنجاز",
      fr: "L'optimisme est la foi qui mène à l'accomplissement",
      en: "Optimism is the faith that leads to achievement"
    }
  },
  {
    id: 14,
    message: {
      ar: "العمل الجاد يؤتي ثماره",
      fr: "Le travail acharné porte ses fruits",
      en: "Hard work pays off"
    },
    quran: {
      ar: "إِنَّا لَا نُضِيعُ أَجْرَ مَنْ أَحْسَنَ عَمَلًا",
      fr: "Certes, Nous ne laissons pas perdre la récompense de celui qui fait le bien",
      en: "Indeed, We will not allow to be lost the reward of any who did well in deeds",
      source: "Sourate Al-Kahf, 30"
    },
    hadith: {
      ar: "مَا أَكَلَ أَحَدٌ طَعَامًا قَطُّ خَيْرًا مِنْ أَنْ يَأْكُلَ مِنْ عَمَلِ يَدِهِ",
      fr: "Nul n'a jamais mangé de nourriture meilleure que celle qu'il a acquise par le travail de ses mains",
      en: "Nobody has ever eaten a better meal than that which one has earned by working with one's own hands",
      source: "Sahih Bukhari"
    },
    citation: {
      ar: "العمل الجاد يتفوق على الموهبة",
      fr: "Le travail acharné bat le talent",
      en: "Hard work beats talent when talent doesn't work hard"
    }
  },
  {
    id: 15,
    message: {
      ar: "أنت تصنع مستقبلك",
      fr: "Tu crées ton propre avenir",
      en: "You create your own future"
    },
    quran: {
      ar: "إِنَّ اللَّهَ لَا يُغَيِّرُ مَا بِقَوْمٍ حَتَّىٰ يُغَيِّرُوا مَا بِأَنفُسِهِمْ",
      fr: "En vérité, Allah ne change pas l'état d'un peuple tant que celui-ci ne change pas ce qui est en lui-même",
      en: "Indeed, Allah will not change the condition of a people until they change what is in themselves",
      source: "Sourate Ar-Ra'd, 11"
    },
    hadith: {
      ar: "الْبِرُّ حُسْنُ الْخُلُقِ",
      fr: "La piété, c'est le bon comportement",
      en: "Righteousness is good character",
      source: "Sahih Muslim"
    },
    citation: {
      ar: "أفضل طريقة للتنبؤ بالمستقبل هي ابتكاره",
      fr: "La meilleure façon de prédire l'avenir est de le créer",
      en: "The best way to predict the future is to create it"
    }
  },
  {
    id: 16,
    message: {
      ar: "كن فخوراً بتقدمك",
      fr: "Sois fier de tes progrès",
      en: "Be proud of your progress"
    },
    quran: {
      ar: "لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ",
      fr: "Si vous êtes reconnaissants, très certainement J'augmenterai [Mes bienfaits] pour vous",
      en: "If you are grateful, I will surely increase you [in favor]",
      source: "Sourate Ibrahim, 7"
    },
    hadith: {
      ar: "مَنْ لَمْ يَشْكُرِ النَّاسَ لَمْ يَشْكُرِ اللَّهَ",
      fr: "Celui qui ne remercie pas les gens ne remercie pas Allah",
      en: "He who does not thank people does not thank Allah",
      source: "Sunan al-Tirmidhi"
    },
    citation: {
      ar: "النجاح ليس نهائياً، والفشل ليس قاتلاً",
      fr: "Le succès n'est pas final, l'échec n'est pas fatal",
      en: "Success is not final, failure is not fatal: it is the courage to continue that counts"
    }
  },
  {
    id: 17,
    message: {
      ar: "استمر في المحاولة",
      fr: "Continue d'essayer",
      en: "Keep trying"
    },
    quran: {
      ar: "فَاصْبِرْ صَبْرًا جَمِيلًا",
      fr: "Endure donc d'une belle endurance",
      en: "So be patient with gracious patience",
      source: "Sourate Al-Ma'arij, 5"
    },
    hadith: {
      ar: "أَحَبُّ الأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ",
      fr: "Les actions les plus aimées d'Allah sont les plus régulières, même si elles sont peu nombreuses",
      en: "The most beloved of deeds to Allah are those that are most consistent, even if they are small",
      source: "Sahih Bukhari"
    },
    citation: {
      ar: "لا يهم كم أنت بطيء ما دمت لا تتوقف",
      fr: "Peu importe la lenteur à laquelle tu vas, du moment que tu ne t'arrêtes pas",
      en: "It does not matter how slowly you go as long as you do not stop"
    }
  },
  {
    id: 18,
    message: {
      ar: "أنت بطل قصتك",
      fr: "Tu es le héros de ton histoire",
      en: "You are the hero of your story"
    },
    quran: {
      ar: "وَكَانَ حَقًّا عَلَيْنَا نَصْرُ الْمُؤْمِنِينَ",
      fr: "Et c'était Notre devoir de secourir les croyants",
      en: "And it was incumbent upon Us to aid the believers",
      source: "Sourate Ar-Rum, 47"
    },
    hadith: {
      ar: "اتَّقِ اللَّهَ حَيْثُمَا كُنْتَ",
      fr: "Crains Allah où que tu sois",
      en: "Fear Allah wherever you are",
      source: "Sunan al-Tirmidhi"
    },
    citation: {
      ar: "كن أنت التغيير الذي تريد أن تراه في العالم",
      fr: "Sois le changement que tu veux voir dans le monde",
      en: "Be the change that you wish to see in the world"
    }
  },
  {
    id: 19,
    message: {
      ar: "اجعل أحلامك حقيقة",
      fr: "Fais de tes rêves une réalité",
      en: "Make your dreams a reality"
    },
    quran: {
      ar: "ادْعُونِي أَسْتَجِبْ لَكُمْ",
      fr: "Appelez-Moi, Je vous répondrai",
      en: "Call upon Me; I will respond to you",
      source: "Sourate Ghafir, 60"
    },
    hadith: {
      ar: "الدُّعَاءُ هُوَ الْعِبَادَةُ",
      fr: "L'invocation, c'est cela l'adoration",
      en: "Supplication is worship",
      source: "Sunan al-Tirmidhi"
    },
    citation: {
      ar: "الحلم لا يتحقق من خلال السحر؛ بل يتطلب العرق والتصميم والعمل الجاد",
      fr: "Un rêve ne devient pas réalité par magie ; il faut de la sueur, de la détermination et du travail acharné",
      en: "A dream doesn't become reality through magic; it takes sweat, determination and hard work"
    }
  },
  {
    id: 20,
    message: {
      ar: "كن ملهماً للآخرين",
      fr: "Sois une source d'inspiration pour les autres",
      en: "Be an inspiration to others"
    },
    quran: {
      ar: "وَجَعَلْنَا بَعْضَكُمْ لِبَعْضٍ فِتْنَةً أَتَصْبِرُونَ",
      fr: "Nous avons fait de certains d'entre vous une épreuve pour les autres. Endurerez-vous ?",
      en: "And We have made some of you [as] a trial for others - will you have patience?",
      source: "Sourate Al-Furqan, 20"
    },
    hadith: {
      ar: "خَيْرُ النَّاسِ أَنْفَعُهُمْ لِلنَّاسِ",
      fr: "Le meilleur des hommes est le plus utile aux autres",
      en: "The best of people are those that are most useful to people",
      source: "Al-Mu'jam al-Awsat"
    },
    citation: {
      ar: "أفضل طريقة لإسعاد نفسك هي محاولة إسعاد شخص آخر",
      fr: "La meilleure façon de se remonter le moral est d'essayer de remonter celui de quelqu'un d'autre",
      en: "The best way to cheer yourself up is to try to cheer somebody else up"
    }
  },
  {
    id: 21,
    message: {
      ar: "النجاح يبدأ بخطوة",
      fr: "Le succès commence par un pas",
      en: "Success starts with a step"
    },
    quran: {
      ar: "فَإِذَا فَرَغْتَ فَانصَبْ",
      fr: "Quand tu as fini, lève-toi donc [pour une autre tâche]",
      en: "So when you have finished [your duties], then stand up [for worship]",
      source: "Sourate Ash-Sharh, 7"
    },
    hadith: {
      ar: "الْبَرَكَةُ فِي الْبُكُورِ",
      fr: "La bénédiction est dans le matin",
      en: "Blessing is in the early morning",
      source: "Sunan Abi Dawud"
    },
    citation: {
      ar: "رحلة الألف ميل تبدأ بخطوة واحدة",
      fr: "Un voyage de mille lieues commence par un pas",
      en: "A journey of a thousand miles begins with a single step"
    }
  },
  {
    id: 22,
    message: {
      ar: "كن شجاعاً في ملاحقة أحلامك",
      fr: "Sois courageux dans la poursuite de tes rêves",
      en: "Be brave in pursuing your dreams"
    },
    quran: {
      ar: "وَلَا تَهِنُوا وَلَا تَحْزَنُوا وَأَنتُمُ الْأَعْلَوْنَ إِن كُنتُم مُّؤْمِنِينَ",
      fr: "Ne vous laissez pas battre, ne vous affligez pas alors que vous êtes les supérieurs, si vous êtes de vrais croyants",
      en: "So do not weaken and do not grieve, and you will be superior if you are [true] believers",
      source: "Sourate Al-Imran, 139"
    },
    hadith: {
      ar: "الْحَيَاءُ لَا يَأْتِي إِلَّا بِخَيْرٍ",
      fr: "La pudeur n'apporte que du bien",
      en: "Modesty only brings good",
      source: "Sahih Bukhari"
    },
    citation: {
      ar: "الشجاعة ليست غياب الخوف، بل القدرة على التغلب عليه",
      fr: "Le courage n'est pas l'absence de peur, mais la capacité de la vaincre",
      en: "Courage is not the absence of fear, but rather the assessment that something else is more important than fear"
    }
  },
  {
    id: 23,
    message: {
      ar: "أنت تستحق النجاح",
      fr: "Tu mérites le succès",
      en: "You deserve success"
    },
    quran: {
      ar: "إِنَّ رَبِّي قَرِيبٌ مُّجِيبٌ",
      fr: "Mon Seigneur est proche et Il répond toujours",
      en: "Indeed, my Lord is near and responsive",
      source: "Sourate Hud, 61"
    },
    hadith: {
      ar: "انْصُرْ أَخَاكَ ظَالِمًا أَوْ مَظْلُومًا",
      fr: "Secours ton frère, qu'il soit oppresseur ou oppressé",
      en: "Help your brother, whether he is an oppressor or is being oppressed",
      source: "Sahih Bukhari"
    },
    citation: {
      ar: "النجاح ليس ما تملكه، بل من أنت",
      fr: "Le succès n'est pas ce que tu as, mais qui tu es",
      en: "Success is not what you have, but who you are"
    }
  },
  {
    id: 24,
    message: {
      ar: "اجعل عملك يتحدث عنك",
      fr: "Laisse ton travail parler pour toi",
      en: "Let your work speak for you"
    },
    quran: {
      ar: "وَتَزَوَّدُوا فَإِنَّ خَيْرَ الزَّادِ التَّقْوَىٰ",
      fr: "Et prenez vos provisions ; mais vraiment la meilleure provision est la piété",
      en: "And take provisions, but indeed, the best provision is fear of Allah",
      source: "Sourate Al-Baqarah, 197"
    },
    hadith: {
      ar: "الدَّالُّ عَلَى الْخَيْرِ كَفَاعِلِهِ",
      fr: "Celui qui montre un bien a la même récompense que celui qui l'a fait",
      en: "Whoever guides someone to goodness will have a reward like one who did it",
      source: "Sahih Muslim"
    },
    citation: {
      ar: "الأفعال تتحدث بصوت أعلى من الكلمات",
      fr: "Les actes parlent plus fort que les mots",
      en: "Actions speak louder than words"
    }
  },
  {
    id: 25,
    message: {
      ar: "كن ممتناً لكل شيء",
      fr: "Sois reconnaissant pour tout",
      en: "Be grateful for everything"
    },
    quran: {
      ar: "فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ",
      fr: "Souvenez-vous de Moi donc, Je vous répondrai. Remerciez-Moi et ne soyez pas ingrats",
      en: "So remember Me; I will remember you. And be grateful to Me and do not deny Me",
      source: "Sourate Al-Baqarah, 152"
    },
    hadith: {
      ar: "عَجَبًا لأَمْرِ الْمُؤْمِنِ إِنَّ أَمْرَهُ كُلَّهُ خَيْرٌ",
      fr: "L'affaire du croyant est étonnante, car tout ce qui lui arrive est un bien",
      en: "How wonderful is the case of a believer; there is good for him in everything",
      source: "Sahih Muslim"
    },
    citation: {
      ar: "الامتنان هو ذاكرة القلب",
      fr: "La gratitude est la mémoire du cœur",
      en: "Gratitude is the memory of the heart"
    }
  },
  {
    id: 26,
    message: {
      ar: "أنت قادر على التغيير",
      fr: "Tu es capable de changer",
      en: "You are capable of change"
    },
    quran: {
      ar: "إِنَّ الْحَسَنَاتِ يُذْهِبْنَ السَّيِّئَاتِ",
      fr: "Les bonnes œuvres dissipent les mauvaises",
      en: "Indeed, good deeds do away with misdeeds",
      source: "Sourate Hud, 114"
    },
    hadith: {
      ar: "كُلُّ بَنِي آدَمَ خَطَّاءٌ وَخَيْرُ الْخَطَّائِينَ التَّوَّابُونَ",
      fr: "Tous les fils d'Adam sont des pécheurs, et les meilleurs des pécheurs sont ceux qui se repentent",
      en: "Every son of Adam commits sin, and the best of those who sin are those who repent",
      source: "Sunan al-Tirmidhi"
    },
    citation: {
      ar: "التغيير هو القانون الوحيد في الحياة",
      fr: "Le changement est la seule loi de la vie",
      en: "Change is the only constant in life"
    }
  },
  {
    id: 27,
    message: {
      ar: "كن صبوراً مع نفسك",
      fr: "Sois patient avec toi-même",
      en: "Be patient with yourself"
    },
    quran: {
      ar: "وَلَمَن صَبَرَ وَغَفَرَ إِنَّ ذَٰلِكَ لَمِنْ عَزْمِ الْأُمُورِ",
      fr: "Celui qui endure et pardonne, c'est là une résolution qui en vaut la peine",
      en: "And whoever is patient and forgives - indeed, that is of the matters [worthy] of resolve",
      source: "Sourate Ash-Shura, 43"
    },
    hadith: {
      ar: "إِنَّ الرِّفْقَ لَا يَكُونُ فِي شَيْءٍ إِلَّا زَانَهُ",
      fr: "La douceur n'est présente dans une chose que pour l'embellir",
      en: "Kindness is not found in anything except that it beautifies it",
      source: "Sahih Muslim"
    },
    citation: {
      ar: "الصبر هو الفضيلة التي تسمح لنا بتحمل الشدائد",
      fr: "La patience est la vertu qui nous permet de supporter l'adversité",
      en: "Patience is a virtue"
    }
  },
  {
    id: 28,
    message: {
      ar: "أنت تملك القوة بداخلك",
      fr: "Tu possèdes la force en toi",
      en: "You possess the strength within you"
    },
    quran: {
      ar: "وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ",
      fr: "Et quiconque place sa confiance en Allah, Il lui suffit",
      en: "And whoever relies upon Allah - then He is sufficient for him",
      source: "Sourate At-Talaq, 3"
    },
    hadith: {
      ar: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ كَنْزٌ مِنْ كُنُوزِ الْجَنَّةِ",
      fr: "'Il n'y a de force et de puissance que par Allah' est un trésor parmi les trésors du Paradis",
      en: "'There is no might nor power except with Allah' is a treasure from the treasures of Paradise",
      source: "Sahih Bukhari"
    },
    citation: {
      ar: "القوة لا تأتي من القدرة الجسدية، بل من الإرادة التي لا تقهر",
      fr: "La force ne vient pas d'une capacité physique, mais d'une volonté indomptable",
      en: "Strength does not come from physical capacity. It comes from an indomitable will"
    }
  },
  {
    id: 29,
    message: {
      ar: "كن دائماً في القمة",
      fr: "Sois toujours au sommet",
      en: "Always be at the top"
    },
    quran: {
      ar: "وَفِي ذَٰلِكَ فَلْيَتَنَافَسِ الْمُتَنَافِسُونَ",
      fr: "Que ceux qui la convoitent entrent en compétition [pour l'acquérir]",
      en: "So for this let the competitors compete",
      source: "Sourate Al-Mutaffifin, 26"
    },
    hadith: {
      ar: "إِذَا سَأَلْتُمُ اللَّهَ فَاسْأَلُوهُ الْفِرْدَوْسَ",
      fr: "Si vous demandez à Allah, demandez-Lui le Firdaws (le plus haut degré du Paradis)",
      en: "When you ask Allah, ask Him for Al-Firdaws",
      source: "Sahih Bukhari"
    },
    citation: {
      ar: "النجاح ليس النهاية، بل هو بداية لنجاح أكبر",
      fr: "Le succès n'est pas la fin, c'est le début d'un succès plus grand",
      en: "Success is not the end, it is the beginning of a greater success"
    }
  },
  {
    id: 30,
    message: {
      ar: "أنت فخر لوالديك",
      fr: "Tu es la fierté de tes parents",
      en: "You are your parents' pride"
    },
    quran: {
      ar: "وَقَضَىٰ رَبُّكَ أَلَّا تَعْبُدُوا إِلَّا إِيَّاهُ وَبِالْوَالِدَيْنِ إِحْسَانًا",
      fr: "Et ton Seigneur a décrété : 'N'adorez que Lui ; et marquez de la bonté envers vos père et mère'",
      en: "And your Lord has decreed that you not worship except Him, and to parents, good treatment",
      source: "Sourate Al-Isra, 23"
    },
    hadith: {
      ar: "رِضَا الرَّبِّ فِي رِضَا الْوَالِدِ",
      fr: "La satisfaction du Seigneur est dans la satisfaction des parents",
      en: "The Lord's pleasure is in the parents' pleasure",
      source: "Sunan al-Tirmidhi"
    },
    citation: {
      ar: "أفضل هدية يمكنك تقديمها لوالديك هي نجاحك",
      fr: "Le meilleur cadeau que tu puisses offrir à tes parents est ta réussite",
      en: "The best gift you can give your parents is your success"
    }
  }
];

export const FOOTER_QUOTES = [
  { ar: "استمر، أنت أقرب مما تعتقد", fr: "Continue, tu es plus proche que tu ne le penses", en: "Keep going, you're closer than you think" },
  { ar: "لا تتوقف أبداً عن الحلم", fr: "N'arrête jamais de rêver", en: "Never stop dreaming" },
  { ar: "كل يوم هو فرصة جديدة", fr: "Chaque jour est une nouvelle chance", en: "Every day is a new chance" },
  { ar: "أنت تصنع المستحيل", fr: "Tu réalises l'impossible", en: "You achieve the impossible" },
  { ar: "ثق في رحلتك", fr: "Fais confiance à ton parcours", en: "Trust your journey" }
];
