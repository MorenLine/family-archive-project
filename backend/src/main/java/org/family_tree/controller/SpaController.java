package org.family_tree.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class SpaController {
    
    @RequestMapping(value = {"/", "/{path:[^\\.]*}"})
    public String redirectToIndex() {
        return "forward:/index.html";
    }
}