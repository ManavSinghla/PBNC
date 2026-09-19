import os
import pymupdf as fitz
from PIL import Image, ImageDraw, ImageFont

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SAMPLES_DIR = os.path.join(BASE_DIR, 'samples')
os.makedirs(SAMPLES_DIR, exist_ok=True)

def create_sample_exam():
    doc = fitz.open()
    page = doc.new_page(width=595, height=842) # A4
    text = """PRAGATI BHARATI ACADEMY
ANNUAL EXAMINATION: COMPUTER SCIENCE & SYSTEMS
Time: 3 Hours                                                     Max Marks: 100

INSTRUCTIONS:
1. All questions are compulsory.
2. Select the most appropriate option for multiple-choice questions.

SECTION A: OBJECTIVE QUESTIONS

1. What is the primary function of the Transformer architecture's multi-head self-attention mechanism?
   (A) To perform sequence recurrent memory retention across timesteps
   (B) To attend to information from different representation subspaces at different positions simultaneously
   (C) To reduce the dimensional size of embedding vectors
   (D) To eliminate the need for feed-forward neural layers

2. Which data structure provides average O(1) time complexity for insertion, deletion, and search operations?
   (A) Balanced Binary Search Tree (AVL)
   (B) Hash Table with uniform distribution
   (C) B-Tree Index
   (D) Min-Heap Priority Queue

3. In PostgreSQL, what is the key difference between an optimistic concurrency control model and row-level advisory locks?
   (A) Advisory locks prevent writes using MVCC tuple versioning exclusively
   (B) Advisory locks provide explicit application-level locking without locking actual table rows
   (C) Row-level advisory locks are automatically released upon any SELECT statement
   (D) Optimistic concurrency requires serial execution of all transactions

4. Which network protocol operates at Layer 4 of the OSI model and provides connectionless, low-latency transmission?
   (A) Transmission Control Protocol (TCP)
   (B) User Datagram Protocol (UDP)
   (C) Hypertext Transfer Protocol (HTTP)
   (D) Internet Protocol (IP)

5. In distributed computing, what property ensures that all cluster nodes see the same data at the same time?
   (A) Availability
   (B) Consistency
   (C) Partition Tolerance
   (D) Eventual Convergence

ANSWER KEY:
1. B
2. B
3. B
4. B
5. B
"""
    page.insert_text((50, 60), text, fontsize=10, fontname="helv")
    pdf_path = os.path.join(SAMPLES_DIR, "sample_exam.pdf")
    doc.save(pdf_path)
    doc.close()
    print(f"Created {pdf_path}")

def create_multipage_split_exam():
    doc = fitz.open()
    # Page 1
    page1 = doc.new_page(width=595, height=842)
    p1_text = """PRAGATI BHARATI - DISTRIBUTED SYSTEMS TEST
PAGE 1 OF 2

1. What does the ACID acronym stand for in database transaction management?
   (A) Atomicity, Consistency, Isolation, Durability
   (B) Accuracy, Coherence, Integrity, Distribution
   (C) Availability, Concurrency, Indexing, Durability
   (D) Asynchronous, Centralized, Immutable, Deterministic

2. Which consensus algorithm is designed to be easily understood and equivalent to Paxos in fault tolerance?
   (A) Byzantine Agreement
   (B) Raft Consensus
   (C) Gossip Protocol
   (D) Proof of Work

3. What is the fundamental mechanism behind Redis in-memory pub/sub message brokering?
   (A) Persistent WAL log replication
   (B) Ephemeral memory-buffered channel broadcasting
   (C) Distributed LSM disk tree
   (D) Two-phase commit protocol

4. Examine the following complex network partitioning scenario:
In a 5-node distributed cluster experiencing a network split between nodes {A, B} and {C, D, E},
determine which partition continues accepting writes under majority quorum rules:
   (A) Partition {A, B} because node A holds the initial leader lease
   (B) Both partitions continue writes independently and merge via CRDTs
"""
    page1.insert_text((50, 60), p1_text, fontsize=10, fontname="helv")

    # Page 2 (Continuation of Question 4 options and answers)
    page2 = doc.new_page(width=595, height=842)
    p2_text = """PRAGATI BHARATI - DISTRIBUTED SYSTEMS TEST
PAGE 2 OF 2

   (C) Partition {C, D, E} because it maintains a strict quorum majority (>50%)
   (D) Neither partition can accept writes until network partition heals

5. State True or False:
Under CAP theorem, a distributed database can achieve both strong consistency and 100% availability during a network partition.
   (A) True
   (B) False

ANSWER KEY:
1. A
2. B
3. B
4. C
5. B
"""
    page2.insert_text((50, 60), p2_text, fontsize=10, fontname="helv")
    pdf_path = os.path.join(SAMPLES_DIR, "sample_multipage_split.pdf")
    doc.save(pdf_path)
    doc.close()
    print(f"Created {pdf_path}")

def create_paired_documents():
    # Question paper only (no answer key)
    doc = fitz.open()
    page = doc.new_page(width=595, height=842)
    qp_text = """PRAGATI BHARATI - ADVANCED ALGORITHMS
QUESTION PAPER (Separate Answer Key Document Required)

1. What is the worst-case time complexity of QuickSort when using naive pivot selection?
   (A) O(n log n)
   (B) O(n^2)
   (C) O(log n)
   (D) O(n)

2. Which algorithm is best suited for finding the shortest path in a graph with non-negative edge weights?
   (A) Bellman-Ford Algorithm
   (B) Floyd-Warshall Algorithm
   (C) Dijkstra's Algorithm
   (D) Kruskal's Algorithm

3. Which dynamic programming algorithm solves the 0/1 Knapsack problem with weights W and N items?
   (A) O(N * W) pseudo-polynomial time
   (B) O(2^N) exponential time
   (C) O(N log N) linearithmic time
   (D) O(W^2) polynomial time
"""
    page.insert_text((50, 60), qp_text, fontsize=11, fontname="helv")
    qp_path = os.path.join(SAMPLES_DIR, "sample_question_paper.pdf")
    doc.save(qp_path)
    doc.close()

    # Separate Answer Key Document
    doc_ak = fitz.open()
    page_ak = doc_ak.new_page(width=595, height=842)
    ak_text = """PRAGATI BHARATI - ADVANCED ALGORITHMS
OFFICIAL EVALUATOR ANSWER KEY (SEPARATE DOCUMENT)

CORRECT ANSWERS:
1. B
2. C
3. A

CONFIDENTIAL - FOR AUTHORIZED EVALUATORS ONLY
"""
    page_ak.insert_text((50, 80), ak_text, fontsize=12, fontname="helv")
    ak_path = os.path.join(SAMPLES_DIR, "sample_answer_key.pdf")
    doc_ak.save(ak_path)
    doc_ak.close()
    print(f"Created paired docs: {qp_path} and {ak_path}")

def create_sample_images():
    # Clean high-res question image
    img = Image.new('RGB', (1000, 650), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)
    text = """MATHEMATICS & LOGIC ADMISSION TEST
Question 1:
Let f(x) = 3x^2 - 4x + 7. Find the derivative f'(2):
(A) 6
(B) 8
(C) 12
(D) 14

Question 2:
Which prime number is the only even prime?
(A) 1
(B) 2
(C) 3
(D) 4

ANSWERS:
1: B
2: B"""
    draw.text((40, 40), text, fill=(0, 0, 0))
    jpg_path = os.path.join(SAMPLES_DIR, "sample_question.jpg")
    img.save(jpg_path, quality=95)
    print(f"Created {jpg_path}")

    # Noisy / low-res scan image
    noisy_img = Image.new('RGB', (800, 500), color=(240, 238, 230)) # aged paper color
    draw_noisy = ImageDraw.Draw(noisy_img)
    noisy_text = """[SCANNED EXAMINATION SHEET - LOW QUALITY]
Q4. In the provided logic circuit diagram, if inputs A=1 and B=0 are passed
    into a NAND gate followed by an XOR gate with C=1, what is the output?
    (A) 0
    (B) 1
    (C) High Impedance (Z)
    (D) Undetermined oscillation

[Note: Answer key smudge on original physical sheet]"""
    draw_noisy.text((30, 30), noisy_text, fill=(40, 40, 50))
    png_path = os.path.join(SAMPLES_DIR, "sample_scanned_noisy.png")
    noisy_img.save(png_path)
    print(f"Created {png_path}")

def create_corrupt_sample():
    corrupt_path = os.path.join(SAMPLES_DIR, "sample_corrupt.pdf")
    with open(corrupt_path, "wb") as f:
        f.write(b"%PDF-1.4\x00\xFF\xFE\xFD CORRUPTED BYTES MALFORMED STRUCTURE")
    print(f"Created {corrupt_path}")

if __name__ == "__main__":
    create_sample_exam()
    create_multipage_split_exam()
    create_paired_documents()
    create_sample_images()
    create_corrupt_sample()
    print("All sample test datasets generated successfully!")
