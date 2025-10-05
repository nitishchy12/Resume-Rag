import os
import re
from typing import List, Tuple, Dict
import pdfplumber
from docx import Document
from rapidfuzz import fuzz, process
import json

def extract_text_from_file(file_path: str) -> str:
    """Extract text from PDF or DOCX file"""
    text = ""
    file_extension = os.path.splitext(file_path)[1].lower()
    
    try:
        if file_extension == '.pdf':
            try:
                with pdfplumber.open(file_path) as pdf:
                    for page in pdf.pages:
                        page_text = page.extract_text()
                        if page_text:
                            text += page_text + "\n"
            except Exception as e:
                print(f"PDF extraction failed: {e}")
                text = f"PDF file uploaded: {os.path.basename(file_path)}\nText extraction failed: {str(e)}"
                
        elif file_extension == '.docx':
            try:
                doc = Document(file_path)
                for paragraph in doc.paragraphs:
                    text += paragraph.text + "\n"
            except Exception as e:
                print(f"DOCX extraction failed: {e}")
                text = f"DOCX file uploaded: {os.path.basename(file_path)}\nText extraction failed: {str(e)}"
        else:
            # Try reading as plain text
            try:
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    text = f.read()
            except Exception as e:
                text = f"File uploaded: {os.path.basename(file_path)}\nUnsupported format or extraction failed: {str(e)}"
                
    except Exception as e:
        print(f"Error extracting text from {file_path}: {e}")
        text = f"File uploaded: {os.path.basename(file_path)}\nExtraction error: {str(e)}"
    
    # Ensure we always return something
    if not text.strip():
        text = f"File uploaded: {os.path.basename(file_path)}\nNo text could be extracted."
    
    return text.strip()

def extract_skills_from_text(text: str) -> List[str]:
    """Extract potential skills from resume text using keyword matching"""
    # Common technical skills - expand this list as needed
    skill_keywords = [
        'python', 'java', 'javascript', 'react', 'django', 'flask', 'node.js',
        'html', 'css', 'sql', 'postgresql', 'mongodb', 'mysql', 'git',
        'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'linux', 'bash',
        'machine learning', 'deep learning', 'tensorflow', 'pytorch',
        'pandas', 'numpy', 'scikit-learn', 'opencv', 'nlp', 'api',
        'rest', 'graphql', 'microservices', 'agile', 'scrum', 'devops',
        'ci/cd', 'jenkins', 'selenium', 'pytest', 'junit', 'spring'
    ]
    
    text_lower = text.lower()
    found_skills = []
    
    for skill in skill_keywords:
        if skill in text_lower:
            found_skills.append(skill.title())
    
    return list(set(found_skills))

def extract_experience_info(text: str) -> str:
    """Extract experience information from resume text"""
    experience_patterns = [
        r'(\d+[\+]?)\s*years?\s*(?:of\s*)?(?:experience|exp)',
        r'experience[:]\s*(\d+[\+]?)\s*years?',
        r'(\d{4})\s*[-–—]\s*(\d{4}|present|current)',
    ]
    
    experiences = []
    for pattern in experience_patterns:
        matches = re.findall(pattern, text.lower())
        experiences.extend([str(match) for match in matches if match])
    
    return ' | '.join(experiences[:3]) if experiences else ''

def calculate_text_similarity(text1: str, text2: str) -> float:
    """Calculate similarity between two texts using fuzzy matching"""
    if not text1 or not text2:
        return 0.0
    
    # Use token sort ratio for better matching
    similarity = fuzz.token_sort_ratio(text1.lower(), text2.lower())
    return similarity / 100.0

def find_matching_resumes(query: str, resume_data: List[Dict]) -> List[Dict]:
    """Find resumes matching a query using fuzzy search"""
    results = []
    
    for resume in resume_data:
        # Combine all searchable text
        searchable_text = f"{resume['name']} {resume['skills']} {resume['extracted_text']}"
        
        # Calculate similarity
        similarity = calculate_text_similarity(query, searchable_text)
        
        if similarity > 0.1:  # Minimum threshold
            # Extract evidence snippets
            words = query.lower().split()
            text_lower = resume['extracted_text'].lower()
            
            snippets = []
            for word in words:
                if word in text_lower:
                    # Find context around the word
                    start_idx = text_lower.find(word)
                    start = max(0, start_idx - 50)
                    end = min(len(text_lower), start_idx + 100)
                    snippet = resume['extracted_text'][start:end].strip()
                    if snippet and len(snippet) > 10:
                        snippets.append(f"...{snippet}...")
            
            results.append({
                'resume_id': resume['id'],
                'name': resume['name'],
                'email': resume['email'],
                'similarity_score': similarity,
                'evidence_snippets': snippets[:3],  # Top 3 snippets
                'matched_skills': resume['skills']
            })
    
    # Sort by similarity score
    results.sort(key=lambda x: x['similarity_score'], reverse=True)
    return results

def match_job_with_resumes(job_requirements: str, resume_data: List[Dict], top_n: int = 10) -> List[Dict]:
    """Match a job with resumes based on requirements"""
    results = []
    
    # Extract key requirements
    job_requirements_lower = job_requirements.lower()
    
    for resume in resume_data:
        # Calculate match score based on skills and text similarity
        skills_text = resume['skills'].lower()
        full_text = f"{resume['skills']} {resume['extracted_text']}".lower()
        
        # Skills matching
        skills_score = calculate_text_similarity(job_requirements_lower, skills_text)
        
        # Overall text matching
        text_score = calculate_text_similarity(job_requirements_lower, full_text)
        
        # Combined score with skills weighted higher
        match_score = (skills_score * 0.7) + (text_score * 0.3)
        
        if match_score > 0.1:  # Minimum threshold
            # Find matched skills
            job_keywords = re.findall(r'\b\w+\b', job_requirements_lower)
            resume_skills = resume['skills'].lower().split(',')
            
            matched_skills = []
            for skill in resume_skills:
                skill = skill.strip()
                if any(keyword in skill for keyword in job_keywords):
                    matched_skills.append(skill.title())
            
            # Find missing requirements (basic implementation)
            missing_reqs = []
            must_have_words = ['required', 'must have', 'essential']
            for req_word in must_have_words:
                if req_word in job_requirements_lower:
                    # Simple extraction of requirements after these keywords
                    sentences = job_requirements.split('.')
                    for sentence in sentences:
                        if req_word in sentence.lower():
                            missing_reqs.append(sentence.strip())
                            break
            
            # Evidence snippets
            evidence_snippets = []
            for skill in matched_skills[:3]:
                if skill.lower() in full_text:
                    start_idx = full_text.find(skill.lower())
                    start = max(0, start_idx - 30)
                    end = min(len(full_text), start_idx + 80)
                    snippet = resume['extracted_text'][start:end].strip()
                    if snippet:
                        evidence_snippets.append(f"...{snippet}...")
            
            results.append({
                'resume_id': resume['id'],
                'name': resume['name'],
                'email': resume['email'],
                'match_score': match_score,
                'matched_skills': matched_skills,
                'missing_requirements': missing_reqs,
                'evidence_snippets': evidence_snippets
            })
    
    # Sort by match score
    results.sort(key=lambda x: x['match_score'], reverse=True)
    return results[:top_n]