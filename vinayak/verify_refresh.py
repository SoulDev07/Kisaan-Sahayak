import firebase_admin
from firebase_admin import credentials, firestore
import os

# Initialize Firebase
cred = credentials.Certificate('serviceAccountKey.json')
try:
    firebase_admin.get_app()
except ValueError:
    firebase_admin.initialize_app(cred)
db = firestore.client()

COLLECTIONS = ['market_data', 'soil_data', 'weather_data']

total_passed = 0
total_failed = 0
collection_results = {}

for col in COLLECTIONS:
    print(f'\n[VERIFY] Checking collection: {col}')
    try:
        docs = list(db.collection(col).stream())
    except Exception as e:
        print(f'[FAIL] Could not access collection {col}: {e}')
        collection_results[col] = {'passed': 0, 'failed': 0, 'error': str(e)}
        continue
    count = len(docs)
    if count == 0:
        print(f'[FAIL] No documents found in {col}.')
        collection_results[col] = {'passed': 0, 'failed': 0}
        total_failed += 1
        continue
    print(f'[PASS] {count} documents found in {col}.')
    passed = 0
    failed = 0
    for doc in docs:
        data = doc.to_dict()
        embedding = data.get('embedding')
        if (
            isinstance(embedding, list)
            and len(embedding) > 0
            and all(isinstance(x, float) or isinstance(x, int) for x in embedding)
        ):
            passed += 1
        else:
            print(f"[FAIL] Document {doc.id} in {col} missing or invalid embedding. Value: {embedding}")
            failed += 1
    if failed == 0:
        print(f'[PASS] All {passed} documents in {col} have valid embeddings.')
    else:
        print(f'[FAIL] {failed} documents in {col} missing/invalid embeddings. {passed} passed.')
    collection_results[col] = {'passed': passed, 'failed': failed}
    total_passed += passed
    total_failed += failed

print('\n[SUMMARY]')
for col, res in collection_results.items():
    if 'error' in res:
        print(f'[FAIL] {col}: {res["error"]}')
    elif res['failed'] == 0 and res['passed'] > 0:
        print(f'[PASS] {col}: {res["passed"]} passed, 0 failed.')
    else:
        print(f'[FAIL] {col}: {res["passed"]} passed, {res["failed"]} failed.')

print(f'\n[FINAL TALLY]')
print(f'Total documents passed: {total_passed}')
print(f'Total documents failed: {total_failed}')
if total_failed == 0 and total_passed > 0:
    print('[PASS] All documents in all collections have valid embeddings!')
else:
    print('[FAIL] Some documents are missing or have invalid embeddings. See above for details.') 