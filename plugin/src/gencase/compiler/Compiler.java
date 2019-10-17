package gencase.compiler;

import com.intellij.openapi.application.Application;
import com.intellij.openapi.application.ApplicationManager;
import com.intellij.openapi.compiler.CompilationException;
import com.intellij.openapi.compiler.CompileContext;
import com.intellij.openapi.compiler.CompilerMessageCategory;
import com.intellij.openapi.module.Module;
import com.intellij.openapi.module.ModuleManager;
import com.intellij.openapi.roots.ModuleRootManager;
import com.intellij.openapi.vfs.VfsUtil;
import com.intellij.openapi.vfs.VirtualFile;
import com.intellij.psi.PsiElement;
import com.intellij.psi.PsiFile;
import com.intellij.psi.PsiManager;
import gencase.GenCaseFile;
import gencase.psi.*;
import org.jetbrains.annotations.NotNull;

import java.util.*;
import java.util.stream.Collectors;

public class Compiler {

    private List<CompilationMessage> messages = new ArrayList<>();

    private static Compiler INSTANCE = new Compiler();
    private enum PREDEINED_TYPES {
        String, Text, Number, Date, DateTime, Boolean
    };

    public static Compiler getInstance() {
        return INSTANCE;
    }

    @NotNull
    public List<CompilationMessage> getMesages(PsiElement element) {
        return messages.size() == 0 ? Collections.emptyList() : messages.stream()
            .filter(e -> element.isEquivalentTo(e.getElement()))
            .collect(Collectors.toList());
    }

    public void compile(CompileContext context) {
        Arrays.stream(ModuleManager.getInstance(context.getProject()).getModules())
            .forEach(m -> compile(m,context));
    }

    void compile(Module module, CompileContext context) {
        System.out.println("Compiling " + module);
        PsiManager manager = PsiManager.getInstance(module.getProject());
        Application application = ApplicationManager.getApplication();
        application.invokeLater(() -> application.runWriteAction(() -> {
            try {
                messages.clear();
                OutputFileBuilder builder = compile(module, manager);
                builder.generateTo(context.getModuleOutputDirectory(module));
            } catch (CompileException ex) {
                messages.addAll(ex.getMessages());
            } catch (Exception ex) {
                System.out.println("Error compiling project");
                ex.printStackTrace();
            }
        }));
    }

    OutputFileBuilder compile(Module module, PsiManager manager) throws CompilationException {
        List<GenCaseEntity> caseEntities = findEntities(module, manager);
        verifyAttributeTypes(caseEntities);
        return OutputFileBuilder.forModule(module)
            .withCase(findCase(module, manager))
            .withPhases(findPhases(module, manager, caseEntities))
            .withEntities(caseEntities);
    }

    GenCaseCase findCase(Module module, PsiManager manager) throws CompilationException {
        List<VirtualFile> files = findFiles(module, manager, GenCaseCase.class);
        if (files.size() == 0) {
            throw new CompilationException("No case found", Collections.singletonList(
                new CompilationException.Message(CompilerMessageCategory.ERROR, "No case found")));
        } else if (files.size() > 1) {
            throw new CompilationException("Mutliple cases found", Collections.singletonList(
                new CompilationException.Message(CompilerMessageCategory.ERROR, "Mutliple cases found")));
        }

        GenCaseFile caseFile = (GenCaseFile) manager.findFile(files.get(0));
        GenCaseCase caseCase = caseFile.findChildByClass(GenCaseCase.class);
        if (caseCase == null) throw new CompilationException("No case found in " + caseFile);
        return caseCase;
    }

    List<GenCaseEntity> findEntities(Module module, PsiManager manager) {
        Set<String> phaseNames = new HashSet<>();
        return findFiles(module, manager, GenCaseEntity.class).stream()
            .map(f -> (GenCaseFile) manager.findFile(f))
            .map(f -> f.findChildByClass(GenCaseEntity.class))
            .map(f -> (GenCaseEntity) verifyDuplicateNames(f, "entity", phaseNames))
            .map(f -> verifyDuplicateAttributes(f))
            .collect(Collectors.toList());
    }

    List<GenCasePhase> findPhases(Module module, PsiManager manager, List<GenCaseEntity> caseEntities) {
        Set<String> phaseNames = new HashSet<>();
        return findFiles(module, manager, GenCasePhase.class).stream()
            .map(f -> (GenCaseFile) manager.findFile(f))
            .map(f -> f.findChildByClass(GenCasePhase.class))
            .map(p -> verifyDuplicatePhases(p, phaseNames))
            .map(p -> verifyPhaseModel(p, caseEntities))
            .collect(Collectors.toList());
    }

    private GenCasePhase verifyDuplicatePhases(GenCasePhase phase, Set<String> names) {
        String name = PsiUtils.getElementOfType(phase.getPhaseDefinition(), Types.IDENTIFIER);
        if (!names.contains(name)) names.add(name);
        else throw new CompileException("Duplicate phase: " + name, phase.getPhaseDefinition());
        return phase;
    }

    private GenCaseEntity verifyDuplicateAttributes(GenCaseEntity caseEntity) {
        List<GenCaseAttribute> attributes = caseEntity.getEntityDefinition().getEntityBody().getAttributeList();
        if (attributes != null) {
            Set<String> names = new HashSet<>();
            attributes.forEach(a -> {
                String name = PsiUtils.getElementOfType(a.getAttributeDefinition(), Types.IDENTIFIER, 1);
                if (!names.contains(name)) names.add(name);
                else throw new CompileException("Duplicate attribute: " + name, a.getAttributeDefinition());
            });
        }

        return caseEntity;
    }

    private void verifyAttributeTypes(List<GenCaseEntity> caseEntities) {
        Set<String> entityNames = caseEntities.stream()
            .map(e -> PsiUtils.getElementOfType(e, Types.IDENTIFIER))
            .filter(n -> n != null)
            .collect(Collectors.toSet());

        entityNames.addAll(Arrays.stream(PREDEINED_TYPES.values())
            .map(e -> e.name())
            .collect(Collectors.toList()));
        caseEntities.forEach(e -> verifyAttributeTypes(e, entityNames));
    }

    private void verifyAttributeTypes(GenCaseEntity caseEntity, Set<String> knownTypes) {
        List<GenCaseAttribute> attributes = caseEntity.getEntityDefinition().getEntityBody().getAttributeList();
        if (attributes != null) attributes.forEach(a -> {
            String type = PsiUtils.getElementOfType(a.getAttributeDefinition(), Types.IDENTIFIER);
            if (!knownTypes.contains(type)) throw new CompileException("Unknown type: " + type, caseEntity);
        });
    }

    private PsiElement verifyDuplicateNames(PsiElement elementOfType, String type, Set<String> names) {
        String name = PsiUtils.getElementOfType(elementOfType, Types.IDENTIFIER);
        if (!names.contains(name)) names.add(name);
        else throw new CompileException("Duplicate " + type + ": " + name, elementOfType);
        return elementOfType;
    }

    private GenCasePhase verifyPhaseModel(GenCasePhase phase, List<GenCaseEntity> caseEntities) {
        GenCaseAnnotation modelAnnotation = PsiUtils.getAnnotation(phase, "Model");
        if (modelAnnotation != null) {
            String modelName = PsiUtils.getAnnotationValue(modelAnnotation, "name", true);
            if (modelName == null) {
                throw new CompileException("Model name not given", modelAnnotation);
            }

            caseEntities.stream()
                .filter(e -> modelName.equals(PsiUtils.getElementOfType(e, Types.IDENTIFIER)))
                .findFirst().orElseThrow(() -> new CompileException("Model " + modelName + " not defined",
                    modelAnnotation));
        }

        return phase;
    }

    private List<VirtualFile> findFiles(Module module, PsiManager manager, Class<? extends PsiElement> caseClass) {
        ArrayList<VirtualFile> files = new ArrayList<>();
        ModuleRootManager rootManager = ModuleRootManager.getInstance(module);
        Arrays.stream(rootManager.getSourceRoots(false)).forEach(r -> {
            VfsUtil.iterateChildrenRecursively(r, f -> {
                if (f.isDirectory()) return true;
                PsiFile cf = manager.findFile(f);
                if (cf instanceof GenCaseFile) {
                    return ((GenCaseFile) cf).findChildByClass(caseClass) != null;
                } else return false;
            }, f -> {
                if (!f.isDirectory()) files.add(f);
                return true;
            });
        });

        return files;
    }

}
