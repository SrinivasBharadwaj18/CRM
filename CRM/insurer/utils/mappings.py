COLUMN_MAPPING = {
    "phone": ["mobile", "phone", "phone number", "contact", "mobile number"],
    "name": ["customer name", "name", "full name", "client name"],
    "address": ["address", "location", "customer address"],
    "vehicle_number": ["vehicle no.", "vehicle no", "vehicle number", "reg no", "car number"],
    "chassis": ["chassis number", "chassis no", "chassis"],
    "make": ["make", "manufacturer", "brand"],
    "model": ["model", "variant", "model name"],
    "rto": ["rto", "rto location", "registration office"],
    "insurance_type": ["insurnace company", "insurance", "insurance type", "type"], # Note: fixed 'insurnace' typo to match your CSV
    "policy_expiry": ["expiry", "policy expiry", "expiry date", "date of expiry"]
}
def normalize(col):
    # Added .replace(".", "") to handle "VEHICLE NO."
    return col.strip().lower().replace("_", " ").replace(".", "")

def build_column_map(csv_columns):

    normalized_columns = {normalize(c): c for c in csv_columns}

    column_map = {}

    for db_field, possible_names in COLUMN_MAPPING.items():
        for name in possible_names:
            name = normalize(name)

            if name in normalized_columns:
                column_map[db_field] = normalized_columns[name]
                break

    return column_map