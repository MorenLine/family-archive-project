package org.family_tree.controller;

import org.family_tree.model.Person;
import org.family_tree.service.PersonService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@Controller
@RequestMapping("/persons")
public class PersonController {
    private final PersonService personService;

    @Autowired
    public PersonController(PersonService personService) {
        this.personService = personService;
    }

    @GetMapping
    public String listPerson(Model model) {
        model.addAttribute("persons", personService.findAll());
        return "person/list";
    }

    @GetMapping("/{id}")
    public String viewPerson(@PathVariable long id, Model model) {
        Optional<Person> personOpt = personService.findById(id);
        if (personOpt.isEmpty()) {
            return "error/404";
        }
        Person person = personOpt.get();
        model.addAttribute("person", person);
        model.addAttribute("children", personService.findChildren(person));
        model.addAttribute("parent1", personService.getParent1(person));
        model.addAttribute("parent2", personService.getParent2(person));

        return "persons/view";
    }

    @GetMapping("/{id}/tree")
    public String viewFamilyTree(@PathVariable Long id, Model model) {
        model.addAttribute("treeData", personService.getFamilyTree(id));
        return "persons/tree";
    }

    @PostMapping("/{id}/set-parents")
    public String setParents(@PathVariable Long id,
                             @RequestParam Long parent1Id,
                             @RequestParam Long parent2Id) {
        personService.setParents(id, parent1Id, parent2Id);
        return "redirect:/persons/" + id;
    }

}
