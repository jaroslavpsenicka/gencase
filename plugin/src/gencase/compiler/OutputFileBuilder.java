package gencase.compiler;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.intellij.openapi.module.Module;
import com.intellij.openapi.util.io.FileUtil;
import com.intellij.openapi.vfs.VirtualFile;
import gencase.psi.*;
import org.junit.Assert;

import java.io.File;
import java.io.IOException;
import java.util.List;

public class OutputFileBuilder {

    private final Module module;
    private GenCaseCase caseCase;
    private List<GenCaseEntity> entities;
    private List<GenCasePhase> phases;

    private Gson gson = new GsonBuilder().setPrettyPrinting().create();

    private static enum KNOWN_ATTR_NAMES {
        Id, NotNull, NotEmpty
    };

    public static OutputFileBuilder forModule(Module module) {
        return new OutputFileBuilder(module);
    }

    private OutputFileBuilder(Module module) {
        this.module = module;
    }

    public OutputFileBuilder withCase(GenCaseCase caseCase) {
        this.caseCase = caseCase;
        return this;
    }

    public OutputFileBuilder withEntities(List<GenCaseEntity> entities) {
        this.entities = entities;
        return this;
    }

    public OutputFileBuilder withPhases(List<GenCasePhase> phases) {
        this.phases = phases;
        return this;
    }

    public void generateTo(VirtualFile outputDirectory) throws IOException {
        Assert.assertNotNull("output directory cannot be null", outputDirectory);
        File outputFile = new File(outputDirectory.getPath(), module.getName() + ".json");
        if (outputFile.exists() && !outputFile.canWrite()) throw new IllegalStateException("cannot write " + outputFile);
        FileUtil.writeToFile(outputFile, this.toJson());
    }

    String toJson() {
        JsonObject root = new JsonObject();
        root.addProperty("name", PsiUtils.getElementOfType(caseCase, Types.IDENTIFIER));

        JsonArray phas = new JsonArray();
        phases.stream().forEach(p -> phas.add(toJson(p)));
        root.add("phases", phas);

        JsonArray ents = new JsonArray();
        entities.stream().forEach(e -> ents.add(toJson(e)));
        root.add("entities", ents);

        return gson.toJson(root);
    }

    // Phase

    private JsonObject toJson(GenCasePhase casePhase) {
        JsonObject object = new JsonObject();
        String name = PsiUtils.getElementOfType(casePhase.getPhaseDefinition(), Types.IDENTIFIER);
        object.addProperty("name", name);
        GenCaseAnnotation modelAnnotation = PsiUtils.getAnnotation(casePhase, "Model");
        if (modelAnnotation != null) {
            String modelName = PsiUtils.getAnnotationValue(modelAnnotation, "name", true);
            object.addProperty("model", modelName);
        }

        return object;
    }

    // Entity

    private JsonObject toJson(GenCaseEntity caseEntity) {
        JsonObject object = new JsonObject();
        object.addProperty("name", PsiUtils.getElementOfType(caseEntity, Types.IDENTIFIER));
        GenCaseExtends entityExtends = caseEntity.getEntityDefinition().getExtends();
        if (entityExtends != null) {
            object.addProperty("extends", PsiUtils.getElementOfType(entityExtends, Types.IDENTIFIER));
        }

        List<GenCaseAttribute> attributes = caseEntity.getEntityDefinition().getEntityBody().getAttributeList();
        if (attributes != null) {
            JsonArray attrs = new JsonArray();
            attributes.forEach(a -> attrs.add(toJson(a)));
            object.add("attributes", attrs);
        }

        return object;
    }

    // Attribute

    private JsonObject toJson(GenCaseAttribute caseAttribute) {
        JsonObject object = new JsonObject();
        object.addProperty("type",
            PsiUtils.getElementOfType(caseAttribute.getAttributeDefinition(), Types.IDENTIFIER, 0));
        object.addProperty("name",
            PsiUtils.getElementOfType(caseAttribute.getAttributeDefinition(), Types.IDENTIFIER, 1));
        if (caseAttribute.getAnnotations() != null) {
            caseAttribute.getAnnotations().getAnnotationList().forEach(a -> {
                String attrName = PsiUtils.getElementOfType(a, Types.IDENTIFIER);
                if (KNOWN_ATTR_NAMES.valueOf(attrName) != null) {
                    object.addProperty(toCamelCase(attrName), true);
                }
            });
        }

        return object;
    }

    private String toCamelCase(String name) {
        if (name != null && name.length() > 0) {
            return name.substring(0, 1).toLowerCase() + name.substring(1);
        }

        return name;
    }


}
