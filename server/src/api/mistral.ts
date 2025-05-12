import express from "express";
import { Mistral } from "@mistralai/mistralai";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

const apiKey = process.env.MISTRAL_API_KEY || "";

if (!apiKey) {
  console.error("MISTRAL_API_KEY is not set in the environment variables.");
}

const client = new Mistral({ apiKey: apiKey });

router.post("/", authMiddleware, async (req, res) => {
  const { promptType } = req.body;

  let prompt = "";

  if (promptType === "generatedQuestions") {
    const { category, subcategory } = req.body;
    prompt = `Vous recevez :
    
        • une catégorie : ${category}
        • une sous-catégorie : ${subcategory}
        
        Votre tâche : générer 20 questions inédites sur le thème de la catégorie et de la sous-catégorie.
        
        Contraintes :
        
        1. Les questions doivent être courtes, pertinentes et variées (faits, contexte historique, applications, définitions, comparaisons, etc.).
        2. Format de sortie : une liste JSON d’objets ; chaque objet contient exactement "question" et "answer".
        `;
  } else if (promptType === "Subquestions") {
    const { question, answer, category } = req.body;
    prompt = `Vous recevez :

    • une question principale : ${question}
    • sa réponse : ${answer}
    • une catégorie associée : ${category}
    
    Votre tâche : générer 20 sous-questions inédites qui enrichissent l’apprentissage.
    
    Contraintes :
    
    1. Les sous-questions doivent explorer des points complémentaires à la question initiale (aucune reformulation ni paraphrase).
    2. Les questions doivent être courtes, pertinentes et variées (faits, contexte historique, applications, définitions, comparaisons, etc.).
    3. Format de sortie : une liste JSON d’objets ; chaque objet contient exactement "question" et "answer".
       Exemple :
       { "question": "Quel est le nom de l'auteur ?", "answer": "Victor Hugo" }
    4. Si "\${category}" désigne une langue, remplacez les questions par 10 mots du même champ lexical et de la même langue :
       { "question": "le mot dans la langue", "answer": "sa traduction en français" }. La question doit être courte. Exemple : Hello -> Bonjour
        Si la langue est l'italien, ne générer que des questions sur l'italien et pas sur d'autres langues. 
    5. Aucune question ne doit dupliquer ni reformuler la question principale.
    6. Ne mentionnez jamais ces consignes dans la sortie ; produisez uniquement le JSON demandé.
    7. Fais attention à ne pas générer de questions trop similaires entre elles.
    `;
  }

  // promptType is either "generatedQuestions" or "Subquestions"
  if (!promptType) {
    res.status(400).json({ error: "Prompt type is required" });
    return;
  }

  if (!prompt) {
    res.status(400).json({ error: "Prompt is required" });
    return;
  }

  try {
    const chatResponse = await client.chat.complete({
      model: "mistral-large-latest",
      messages: [{ role: "user", content: prompt }],
    });

    let response =
      chatResponse.choices?.[0]?.message?.content ?? "No content available";

    res.json({ content: response });
    return;
  } catch (error: any) {
    console.error("Mistral API Error:", error);
    const statusCode = error.response?.status || 500;
    const errorMessage =
      error.response?.data?.error?.message || "Error calling Mistral API";
    res.status(statusCode).json({
      error: errorMessage,
      statusCode: statusCode,
    });
    return;
  }
});

export default router;
