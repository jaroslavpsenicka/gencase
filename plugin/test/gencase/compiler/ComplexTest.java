package gencase.compiler;

import com.intellij.openapi.compiler.CompilationException;
import com.intellij.openapi.module.Module;
import com.intellij.openapi.roots.ModuleRootManager;
import com.intellij.openapi.vfs.VFileProperty;
import com.intellij.openapi.vfs.VirtualFile;
import com.intellij.psi.PsiFile;
import com.intellij.psi.impl.PsiManagerEx;
import com.intellij.testFramework.LightVirtualFile;
import com.intellij.testFramework.ParsingTestCase;
import gencase.GenCaseParserDefinition;
import org.mockito.Mockito;

import java.io.IOException;

import static org.mockito.Matchers.anyBoolean;
import static org.mockito.Matchers.eq;

public class ComplexTest extends ParsingTestCase {

    private Module module;
    private PsiManagerEx psiManager;

    public ComplexTest() {
        super("", "gcl", new GenCaseParserDefinition());
    }

    @Override
    protected void setUp() throws Exception {
        super.setUp();

        LightVirtualFile caseFile = new LightVirtualFile("Case", this.myLanguage,
            loadFile("case.gcl"));
        PsiFile caseCase = this.createFile(caseFile);
        LightVirtualFile modelingPhaseFile = new LightVirtualFile("ModelingPhase", this.myLanguage,
            loadFile("modeling.phase.gcl"));
        PsiFile modelingPhase = this.createFile(modelingPhaseFile);
        LightVirtualFile constructionPhaseFile = new LightVirtualFile("ConstructionPhase", this.myLanguage,
            loadFile("construction.phase.gcl"));
        PsiFile constructionPhase = this.createFile(constructionPhaseFile);
        LightVirtualFile caseModelFile = new LightVirtualFile("CaseModel", this.myLanguage,
            loadFile("case.model.gcl"));
        PsiFile caseModel = this.createFile(caseModelFile);
        LightVirtualFile modelingModelFile = new LightVirtualFile("ModelingModel", this.myLanguage,
            loadFile("modeling.model.gcl"));
        PsiFile modelingModel = this.createFile(modelingModelFile);
        LightVirtualFile constructionModelFile = new LightVirtualFile("ConstructionModel", this.myLanguage,
            loadFile("construction.model.gcl"));
        PsiFile constructionModel = this.createFile(constructionModelFile);

        VirtualFile src = Mockito.mock(VirtualFile.class);
        Mockito.when(src.isDirectory()).thenReturn(true);
        Mockito.when(src.isValid()).thenReturn(true);
        Mockito.when(src.is(eq(VFileProperty.SYMLINK))).thenReturn(false);
        Mockito.when(src.getChildren()).thenReturn(new VirtualFile[] {
            caseCase.getVirtualFile(),
            caseModel.getVirtualFile(),
            modelingPhase.getVirtualFile(),
            constructionPhase.getVirtualFile(),
            modelingModel.getVirtualFile(),
            constructionModel.getVirtualFile()
        });

        ModuleRootManager rootManager = Mockito.mock(ModuleRootManager.class);
        Mockito.when(rootManager.getSourceRoots(anyBoolean())).thenReturn(new VirtualFile[] { src });
        module = Mockito.mock(Module.class);
        Mockito.when(module.getComponent(eq(ModuleRootManager.class))).thenReturn(rootManager);
        psiManager = Mockito.mock(PsiManagerEx.class);
        Mockito.when(psiManager.findFile(eq(caseFile))).thenReturn(caseCase);
        Mockito.when(psiManager.findFile(eq(modelingPhaseFile))).thenReturn(modelingPhase);
        Mockito.when(psiManager.findFile(eq(constructionPhaseFile))).thenReturn(constructionPhase);
        Mockito.when(psiManager.findFile(eq(caseModelFile))).thenReturn(caseModel);
        Mockito.when(psiManager.findFile(eq(modelingModelFile))).thenReturn(modelingModel);
        Mockito.when(psiManager.findFile(eq(constructionModelFile))).thenReturn(constructionModel);
    }

    public void testComplex() throws CompilationException, IOException {
        OutputFileBuilder builder = new Compiler().compile(module, psiManager);
        assertEquals(loadFile("case.txt"), builder.toJson());
    }

    @Override
    protected String getTestDataPath() {
        return "test/resources/compiler/complex";
    }

    @Override
    protected boolean includeRanges() {
        return true;
    }

}
