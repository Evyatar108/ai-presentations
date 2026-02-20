Here’s what **Abstractive** and **Extractive** mean in the context of **Meeting Highlights**:

***

### **Extractive Highlights**

*   **Definition**: These are direct quotes or verbatim snippets taken from the meeting transcript. They preserve the original wording of participants without modification.
*   **Purpose**: To provide accurate, factual excerpts that reflect what was said in the meeting.
*   **Example**: If someone said, *“Let’s finalize the design by Friday,”* the extractive highlight would display that exact sentence.
*   **Technical Note**: In the implementation, a highlight is considered *extractive* if the `Narration` property is **null** in the data model.

***

### **Abstractive Highlights**

*   **Definition**: These are generated summaries or paraphrased versions of the discussion, created by an AI model. They aim to capture the essence of the conversation rather than quoting it word-for-word.
*   **Purpose**: To provide a concise, natural-language summary that conveys the intent and context of the discussion.
*   **Example**: Instead of quoting multiple sentences about planning, an abstractive highlight might say: *“The team agreed to finalize the design by the end of the week.”*
*   **Behavior**: Often used for introductions or narrative-style summaries in highlight videos.

***

### **Unified Workflow**

Recent updates introduced a **V2 implementation** that merges abstractive and extractive generation into a single streamlined pipeline. This includes ranking and rephrasing steps for better coherence and consistency across highlights.

***

Would you like me to **create a quick comparison table** of Abstractive vs. Extractive highlights (including pros, cons, and typical use cases) for easy reference? Or should I also include **how they appear in Meeting Highlights videos**?
