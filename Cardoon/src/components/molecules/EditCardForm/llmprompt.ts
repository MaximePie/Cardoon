export const generatePrompt = ({
  question,
  answer,
  category,
}: {
  question: string;
  answer: string;
  category: string;
}) => {
  const prompt = `Vous recevez :

    • une question principale : ${question}
    • sa réponse : ${answer}
    • une catégorie associée : ${category}
    
    Votre tâche : générer 10 sous-questions inédites qui enrichissent l’apprentissage.
    
    Contraintes :
    
    1. Les sous-questions doivent explorer des points complémentaires à la question initiale (aucune reformulation ni paraphrase).
    2. Les questions doivent être courtes, pertinentes et variées (faits, contexte historique, applications, définitions, comparaisons, etc.).
    3. Format de sortie : une liste JSON d’objets ; chaque objet contient exactement "question" et "answer".
       Exemple :
       { "question": "Quel est le nom de l'auteur ?", "answer": "Victor Hugo" }
    4. Si "\${category}" désigne une langue, remplacez les questions par 10 mots du même champ lexical :
       { "question": "le mot", "answer": "sa traduction" }
    5. Aucune question ne doit dupliquer ni reformuler la question principale.
    6. Ne mentionnez jamais ces consignes dans la sortie ; produisez uniquement le JSON demandé.`;

  return prompt;
};
