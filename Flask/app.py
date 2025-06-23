from flask import Flask, request, send_file, jsonify
import fitz  # PyMuPDF
import os
from werkzeug.utils import secure_filename
from flask_cors import CORS
from transformers import pipeline
from PyPDF2 import PdfReader
import cohere


app = Flask(__name__)
CORS(app)


UPLOAD_FOLDER = "uploads"
OUTPUT_FOLDER = "extracted_images"


os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

co = cohere.Client('sBFUektmoMTGoCRgrrcA0pbAkyjYfelGeA23H0ZL')  # Replace with your real API key

@app.route("/upload", methods=["POST"])
def upload_pdf():
    if "pdf" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    pdf_file = request.files["pdf"]
    if pdf_file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    filename = secure_filename(pdf_file.filename)
    pdf_path = os.path.join(UPLOAD_FOLDER, filename)
    pdf_file.save(pdf_path)

    # Extract images
    extracted_images = extract_images_from_pdf(pdf_path)

    return jsonify({"images": extracted_images})


def extract_images_from_pdf(pdf_path):
    """Extract all images from a PDF and save them as separate files."""
    doc = fitz.open(pdf_path)
    image_urls = []

    for page_number in range(len(doc)):
        for img_index, img in enumerate(doc[page_number].get_images(full=True)):
            xref = img[0]
            base_image = doc.extract_image(xref)
            image_bytes = base_image["image"]
            image_ext = base_image["ext"]

            image_filename = f"page_{page_number+1}_img_{img_index+1}.{image_ext}"
            image_path = os.path.join(OUTPUT_FOLDER, image_filename)

            with open(image_path, "wb") as img_file:
                img_file.write(image_bytes)

            image_urls.append(f"/download/{image_filename}")

    return image_urls


@app.route("/download/<filename>", methods=["GET"])
def download_image(filename):
    image_path = os.path.join(OUTPUT_FOLDER, filename)
    return send_file(image_path, as_attachment=True)



# # Load summarizer once
# print("Loading summarization model...")
# summarizer = pipeline("summarization", model="facebook/bart-large-cnn")

# # Extract text from PDF
# def extract_text_from_pdf(pdf_file):
#     print("Extracting text from PDF...")
#     reader = PdfReader(pdf_file)
#     print("Reading PDF...")
#     text = ""
#     for page in reader.pages:
#         page_text = page.extract_text()
#         if page_text:
#             text += page_text + " "
#     return text.strip()

# # Split text into chunks
# def split_text(text, chunk_size=500):
#     words = text.split()
#     return [" ".join(words[i:i+chunk_size]) for i in range(0, len(words), chunk_size)]

# # Summarize text
# def generate_long_summary(text):
#     chunks = split_text(text)
#     summaries = []
#     for i, chunk in enumerate(chunks):
#         try:
#             summary = summarizer(chunk, max_length=250, min_length=100, do_sample=False)[0]['summary_text']
#             summaries.append(summary)
#         except Exception as e:
#             summaries.append(f"Error summarizing chunk {i+1}: {e}")
#     return "\n\n".join(summaries)


# Initialize Cohere client

def cohere_question_answer(context, question):
    prompt = f"""You are an intelligent assistant. Use the context below to answer the question accurately and concisely.

Context:
{context}

Question: {question}
Answer:"""

    response = co.generate(
        model='command',
        prompt=prompt,
        max_tokens=300,
        temperature=0.3
    )

    return response.generations[0].text.strip()

@app.route('/api/ask', methods=['POST'])
def ask_question():
    data = request.get_json()
    context = data.get('context', '')
    question = data.get('question', '')

    # Truncate context if it's too long
    max_length = 512
    context = ' '.join(context.split()[:max_length])
    
    if not context or not question:
        return jsonify({'error': 'Missing context or question'}), 400

    answer = cohere_question_answer(context, question)
    return jsonify({'answer': answer})

@app.route('/summarize', methods=['POST'])
def summarize_pdf():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    
    file = request.files['file']
    print(file)

    if file.filename == '':
        return jsonify({'error': 'Empty file name'}), 400

    try:
        text = extract_text_from_pdf(file)
        print("Extracted text:", text)
        summary = generate_long_summary(text)
        print("Generated summary:", summary)
        return jsonify({'summary': summary})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)
