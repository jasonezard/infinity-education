import json
import openai
from firebase_functions import https_fn
from firebase_admin import firestore, initialize_app

# Initialize Firebase Admin
initialize_app()

@https_fn.on_call()
def generate_learning_journey(req: https_fn.CallableRequest) -> dict:
    """
    Generate a Learning Journey report using OpenAI based on selected anecdotal records.
    
    Expected request data:
    {
        "record_ids": ["record1", "record2", ...],
        "student_name": "Student Name"
    }
    """
    
    try:
        # Verify authentication
        if not req.auth:
            raise https_fn.HttpsError(
                code=https_fn.FunctionsErrorCode.UNAUTHENTICATED,
                message="User must be authenticated"
            )
        
        # Get request data
        record_ids = req.data.get('record_ids', [])
        student_name = req.data.get('student_name', '')
        
        if not record_ids:
            raise https_fn.HttpsError(
                code=https_fn.FunctionsErrorCode.INVALID_ARGUMENT,
                message="No record IDs provided"
            )
        
        if not student_name:
            raise https_fn.HttpsError(
                code=https_fn.FunctionsErrorCode.INVALID_ARGUMENT,
                message="Student name is required"
            )
        
        # Initialize Firestore client
        db = firestore.client()
        
        # Fetch the anecdotal records
        records = []
        for record_id in record_ids:
            doc_ref = db.collection('anecdotal_records').document(record_id)
            doc = doc_ref.get()
            
            if doc.exists:
                record_data = doc.to_dict()
                records.append(record_data)
        
        if not records:
            raise https_fn.HttpsError(
                code=https_fn.FunctionsErrorCode.NOT_FOUND,
                message="No valid records found"
            )
        
        # Prepare the prompt for OpenAI
        observations_text = "\n\n".join([
            f"Skill: {record['valueTag']}\n"
            f"Assessment Type: {record['assessmentType']}\n"
            f"Observation: {record['note']}\n"
            f"Date: {record['createdAt'].strftime('%Y-%m-%d') if 'createdAt' in record else 'Unknown'}"
            for record in records
        ])
        
        prompt = f"""
        You are an educational professional writing a Learning Journey report for a student named {student_name}. 
        
        Based on the following classroom observations, create a comprehensive and positive Learning Journey report that:
        1. Highlights the student's growth and development
        2. Identifies key strengths and areas of progress
        3. Provides specific examples from the observations
        4. Uses professional, encouraging language appropriate for parents
        5. Suggests areas for continued growth and support
        
        Observations:
        {observations_text}
        
        Please write a well-structured Learning Journey report (approximately 300-500 words) that celebrates this student's learning and development.
        """
        
        # Set up OpenAI (you'll need to set the API key as an environment variable)
        openai.api_key = os.environ.get('OPENAI_API_KEY')
        
        # Generate the report using OpenAI
        response = openai.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system", 
                    "content": "You are an experienced elementary school teacher writing professional Learning Journey reports for parents."
                },
                {
                    "role": "user", 
                    "content": prompt
                }
            ],
            max_tokens=800,
            temperature=0.7
        )
        
        generated_report = response.choices[0].message.content
        
        return {
            "success": True,
            "report": generated_report,
            "student_name": student_name,
            "records_processed": len(records)
        }
        
    except https_fn.HttpsError:
        # Re-raise Firebase function errors
        raise
    except Exception as e:
        # Handle any other errors
        raise https_fn.HttpsError(
            code=https_fn.FunctionsErrorCode.INTERNAL,
            message=f"An error occurred: {str(e)}"
        )