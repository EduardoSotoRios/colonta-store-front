export type PhoneCountry = {
  iso: string;
  name: string;
  dial: string;
};

function flagEmoji(iso: string): string {
  return String.fromCodePoint(...iso.toUpperCase().split("").map((c) => 127397 + c.charCodeAt(0)));
}

export const PHONE_COUNTRIES: PhoneCountry[] = [
  { iso: "CL", name: "Chile", dial: "+56" },
  { iso: "AR", name: "Argentina", dial: "+54" },
  { iso: "PE", name: "Perú", dial: "+51" },
  { iso: "BO", name: "Bolivia", dial: "+591" },
  { iso: "CO", name: "Colombia", dial: "+57" },
  { iso: "EC", name: "Ecuador", dial: "+593" },
  { iso: "UY", name: "Uruguay", dial: "+598" },
  { iso: "PY", name: "Paraguay", dial: "+595" },
  { iso: "VE", name: "Venezuela", dial: "+58" },
  { iso: "BR", name: "Brasil", dial: "+55" },
  { iso: "MX", name: "México", dial: "+52" },
  { iso: "PA", name: "Panamá", dial: "+507" },
  { iso: "CR", name: "Costa Rica", dial: "+506" },
  { iso: "GT", name: "Guatemala", dial: "+502" },
  { iso: "HN", name: "Honduras", dial: "+504" },
  { iso: "NI", name: "Nicaragua", dial: "+505" },
  { iso: "SV", name: "El Salvador", dial: "+503" },
  { iso: "DO", name: "República Dominicana", dial: "+1" },
  { iso: "CU", name: "Cuba", dial: "+53" },
  { iso: "PR", name: "Puerto Rico", dial: "+1" },
  { iso: "US", name: "Estados Unidos", dial: "+1" },
  { iso: "CA", name: "Canadá", dial: "+1" },
  { iso: "ES", name: "España", dial: "+34" },
  { iso: "PT", name: "Portugal", dial: "+351" },
  { iso: "FR", name: "Francia", dial: "+33" },
  { iso: "IT", name: "Italia", dial: "+39" },
  { iso: "DE", name: "Alemania", dial: "+49" },
  { iso: "GB", name: "Reino Unido", dial: "+44" },
  { iso: "IE", name: "Irlanda", dial: "+353" },
  { iso: "NL", name: "Países Bajos", dial: "+31" },
  { iso: "BE", name: "Bélgica", dial: "+32" },
  { iso: "CH", name: "Suiza", dial: "+41" },
  { iso: "AT", name: "Austria", dial: "+43" },
  { iso: "SE", name: "Suecia", dial: "+46" },
  { iso: "NO", name: "Noruega", dial: "+47" },
  { iso: "DK", name: "Dinamarca", dial: "+45" },
  { iso: "FI", name: "Finlandia", dial: "+358" },
  { iso: "PL", name: "Polonia", dial: "+48" },
  { iso: "GR", name: "Grecia", dial: "+30" },
  { iso: "RU", name: "Rusia", dial: "+7" },
  { iso: "UA", name: "Ucrania", dial: "+380" },
  { iso: "TR", name: "Turquía", dial: "+90" },
  { iso: "IL", name: "Israel", dial: "+972" },
  { iso: "AE", name: "Emiratos Árabes Unidos", dial: "+971" },
  { iso: "SA", name: "Arabia Saudita", dial: "+966" },
  { iso: "EG", name: "Egipto", dial: "+20" },
  { iso: "ZA", name: "Sudáfrica", dial: "+27" },
  { iso: "NG", name: "Nigeria", dial: "+234" },
  { iso: "CN", name: "China", dial: "+86" },
  { iso: "JP", name: "Japón", dial: "+81" },
  { iso: "KR", name: "Corea del Sur", dial: "+82" },
  { iso: "IN", name: "India", dial: "+91" },
  { iso: "PK", name: "Pakistán", dial: "+92" },
  { iso: "PH", name: "Filipinas", dial: "+63" },
  { iso: "TH", name: "Tailandia", dial: "+66" },
  { iso: "VN", name: "Vietnam", dial: "+84" },
  { iso: "ID", name: "Indonesia", dial: "+62" },
  { iso: "MY", name: "Malasia", dial: "+60" },
  { iso: "SG", name: "Singapur", dial: "+65" },
  { iso: "AU", name: "Australia", dial: "+61" },
  { iso: "NZ", name: "Nueva Zelanda", dial: "+64" },
].map((c) => ({ ...c, name: `${flagEmoji(c.iso)} ${c.name}` }));

export function getPhoneCountry(iso: string): PhoneCountry {
  return PHONE_COUNTRIES.find((c) => c.iso === iso) ?? PHONE_COUNTRIES[0];
}
