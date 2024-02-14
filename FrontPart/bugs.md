Bug no 1

Given: je me connecte en tant qu'employé
then: je crée une note de frais de l'année 1500
then: la note de frais est acceptée

Bug no 2
Given: quand je cree une note de frais et que je ne la valide pas
then: elle est enregistree comme nulle

Bug no3
Given: je crée une nouvelle note de frais et je la valide
then: mes notes de frais ne sont plus dans le bon ordre


Bug no4
Given: je crée une nouvelle note de frais avec une valeur de 0 et je la valide
then:la note de frais est acceptee

Bug no5
Given: je crée une nouvelle note de frais avec une TVA absurde( ex:>100)
then:la note de frais est acceptee