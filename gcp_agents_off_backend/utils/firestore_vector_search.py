import numpy as np
from services.firebase import db

def cosine_similarity(a, b):
    a = np.array(a)
    b = np.array(b)
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))

# Retrieve all farmer docs and their vectors, return top_k most similar
# section can be 'profile', 'livestock', 'crops', 'calendarEvents', 'marketListings', 'chatHistory', 'documents'
def search_farmers_by_vector(query_embedding, section='crops', top_k=3):
    farmers_ref = db.collection('farmers')
    docs = farmers_ref.stream()
    scored = []
    for doc in docs:
        data = doc.to_dict()
        vectors = data.get('vectors', {})
        section_vec = vectors.get(section)
        if section_vec:
            sim = cosine_similarity(query_embedding, section_vec)
            scored.append((sim, data, doc.id))
    scored.sort(reverse=True, key=lambda x: x[0])
    return scored[:top_k] 