import {Table} from "flowbite-react";
import del from "../../images/delete.png"
import updt from "../../images/update.png"
import "../../CSS/produits_data.css"

export default function DisplayProductData() {
    return (
        <Table responsive="sm">
            <thead>
            <tr>
                <th>Image</th>
                <th>Identifiant</th>
                <th>type</th>
                <th>Titre</th>
                <th>Catégorie</th>
                <th>Code-barres</th>
                <th>Emplacement</th>
                <th>Mots-clés</th>
                <th>Date de création</th>
                <th>Modifier</th>
                <th>Supprimer</th>
            </tr>
            </thead>
            <tbody>
            <tr>
                <td>Image 1</td>
                <td>ID12345</td>
                <td>Type A</td>
                <td>Titre Exemple 1</td>
                <td>Catégorie 1</td>
                <td>123456789</td>
                <td>Emplacement A</td>
                <td>Mot-clé 1, Mot-clé 2</td>
                <td>2024-06-21</td>
                <td><img src={updt} alt={updt}/></td>
                <td><img src={del} alt={del}/></td>
            </tr>
            <tr>
                <td>Image 2</td>
                <td>ID67890</td>
                <td>Type B</td>
                <td>Titre Exemple 2</td>
                <td>Catégorie 2</td>
                <td>987654321</td>
                <td>Emplacement B</td>
                <td>Mot-clé 3, Mot-clé 4</td>
                <td>2024-06-20</td>
                <td><img src={updt} alt={updt}/></td>
                <td><img src={del} alt={del}/></td>
            </tr>
            </tbody>
        </Table>
    )
}