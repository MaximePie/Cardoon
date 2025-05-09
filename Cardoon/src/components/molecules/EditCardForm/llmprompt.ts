interface SubQuestionsParameters {
  question: string;
  answer: string;
  category: string;
}
// Used when reviewing a card and wanting to generate subquestions
export const generateSubquestions = ({
  question,
  answer,
  category,
}: SubQuestionsParameters) => {
  const prompt = `Vous recevez :

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
    4. Si "\${category}" désigne une langue, remplacez les questions par 10 mots du même champ lexical :
       { "question": "le mot dans la langue", "answer": "sa traduction en français" }. La question doit être courte. Exemple : Hello -> Bonjour
    5. Aucune question ne doit dupliquer ni reformuler la question principale.
    6. Ne mentionnez jamais ces consignes dans la sortie ; produisez uniquement le JSON demandé.
    7. Fais attention à ne pas générer de questions trop similaires entre elles.
    `;

  return prompt;
};

interface QuestionParameters {
  category: string;
  subcategory: string;
}
// Used to create a set of new cards based on a category (and a subcategory)
export const makeQuestionsPrompt = ({
  category,
  subcategory,
}: QuestionParameters) => {
  if (category === "") {
    return "";
  }
  const prompt = `Vous recevez :
    
        • une catégorie : ${category}
        • une sous-catégorie : ${subcategory}
        
        Votre tâche : générer 20 questions inédites sur le thème de la catégorie et de la sous-catégorie.
        
        Contraintes :
        
        1. Les questions doivent être courtes, pertinentes et variées (faits, contexte historique, applications, définitions, comparaisons, etc.).
        2. Format de sortie : une liste JSON d’objets ; chaque objet contient exactement "question" et "answer".
         Exemple :
         { "question": "Quel est le nom de l'auteur de Salembo?", "answer": "Gustave Flaubert" }
        3. Aucune question ne doit dupliquer ni reformuler la question principale.
        4. Ne mentionnez jamais ces consignes dans la sortie ; produisez uniquement le JSON demandé.
        5. Si "\${category}" désigne une langue, générer 10 mots de vocabulaire de la langue demandée. Ces mots doivent être communs et utiles dans la vie quotidienne, et en rapport avec la sous-catégorie. Le format de sortie doit être "{"question": "le mot dans la langue", "answer": "sa traduction en français" }".
        Bon Exemple : Hello -> Bonjour
        Mauvais exemple : "Comment dit-on 'Bonjour' en anglais ?" -> "Hello"
        6. Fais attention à ne pas générer de questions trop similaires entre elles.
        `;

  return prompt;
};
