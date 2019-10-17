package gencase.compiler;

import com.intellij.openapi.module.Module;
import com.intellij.openapi.roots.ModuleRootManager;
import com.intellij.openapi.vfs.VFileProperty;
import com.intellij.openapi.vfs.VirtualFile;
import com.intellij.psi.PsiFile;
import com.intellij.psi.impl.PsiManagerEx;
import com.intellij.testFramework.LightVirtualFile;
import com.intellij.testFramework.ParsingTestCase;
import gencase.GenCaseParserDefinition;
import junit.framework.TestCase;
import org.mockito.Mockito;

import java.util.Collections;

import static org.mockito.Matchers.anyBoolean;
import static org.mockito.Matchers.eq;

public class DuplicatePhaseTest extends ParsingTestCase {

    private Module module;
    private PsiManagerEx psiManager;

    public DuplicatePhaseTest() {
        super("", "gcl", new GenCaseParserDefinition());
    }

    @Override
    protected void setUp() throws Exception {
        super.setUp();
        LightVirtualFile file1 = new LightVirtualFile("Phase1", this.myLanguage, loadFile("Phase.gcl"));
        PsiFile entity1 = this.createFile(file1);
        LightVirtualFile file2 = new LightVirtualFile("Phase2", this.myLanguage, loadFile("Phase.gcl"));
        PsiFile entity2 = this.createFile(file1);

        VirtualFile src = Mockito.mock(VirtualFile.class);
        Mockito.when(src.isDirectory()).thenReturn(true);
        Mockito.when(src.isValid()).thenReturn(true);
        Mockito.when(src.is(eq(VFileProperty.SYMLINK))).thenReturn(false);
        Mockito.when(src.getChildren()).thenReturn(new VirtualFile[] {
            entity1.getVirtualFile(), entity2.getVirtualFile() }
        );

        ModuleRootManager rootManager = Mockito.mock(ModuleRootManager.class);
        Mockito.when(rootManager.getSourceRoots(anyBoolean())).thenReturn(new VirtualFile[] { src });
        module = Mockito.mock(Module.class);
        Mockito.when(module.getComponent(eq(ModuleRootManager.class))).thenReturn(rootManager);
        psiManager = Mockito.mock(PsiManagerEx.class);
        Mockito.when(psiManager.findFile(eq(file1))).thenReturn(entity1);
        Mockito.when(psiManager.findFile(eq(file2))).thenReturn(entity2);
    }

    public void testDuplicatePhase() {
        try {
            new Compiler().findPhases(module, psiManager, Collections.emptyList());
            TestCase.fail();
        } catch (CompileException ex) {
            TestCase.assertEquals(1, ex.getMessages().size());
            TestCase.assertEquals("Duplicate phase: Phase", ex.getMessages().stream()
                .findFirst().orElseThrow(() -> new IllegalStateException("no message"))
                .getText());
        }
    }

    @Override
    protected String getTestDataPath() {
        return "test/resources/compiler";
    }

    @Override
    protected boolean includeRanges() {
        return true;
    }

}
